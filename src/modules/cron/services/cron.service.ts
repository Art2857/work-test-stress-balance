import { EventEmitter } from 'events';
import { config } from '../../../config';
import { CronRepository } from '../repository/cron.repository';
import { CronJob } from '../domain/cron-job.entity';
import { CronExecution } from '../domain/cron-execution.entity';
import { CronJobExecutor } from './cron-job-executor.service';

export interface CronServiceConfig {
  serverId: string;
  checkInterval: number;
  lockDuration: number;
  maxConcurrentJobs: number;
}

export class CronService extends EventEmitter {
  private repository: CronRepository;
  private executor: CronJobExecutor;
  private config: CronServiceConfig;
  private isRunning: boolean = false;
  private checkTimer?: ReturnType<typeof setTimeout>;
  private activeJobs: Map<
    number,
    { execution: CronExecution; timeout: ReturnType<typeof setTimeout> }
  > = new Map();

  constructor(
    repository: CronRepository,
    executor: CronJobExecutor,
    cronConfig?: Partial<CronServiceConfig>
  ) {
    super();
    this.repository = repository;
    this.executor = executor;
    this.config = {
      serverId: this.generateServerId(),
      checkInterval: 30000,
      lockDuration: 150000,
      maxConcurrentJobs: 10,
      ...cronConfig,
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log(`🕐 Cron service started on server: ${this.config.serverId}`);

    this.scheduleJobCheck();

    process.on('SIGTERM', () => this.stop());
    process.on('SIGINT', () => this.stop());
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    console.log(`🛑 Stopping cron service on server: ${this.config.serverId}`);

    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
    }

    const stopPromises = Array.from(this.activeJobs.values()).map(
      async ({ execution, timeout }) => {
        clearTimeout(timeout);
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
          await this.repository.completeExecution(
            execution.id,
            'Server stopped during execution',
            'failed'
          );
        } catch (error) {
          console.error('Error completing execution during shutdown:', error);
        }
      }
    );

    await Promise.all(stopPromises);
    this.activeJobs.clear();

    console.log(`✅ Cron service stopped on server: ${this.config.serverId}`);
  }

  private scheduleJobCheck(): void {
    if (!this.isRunning) {
      return;
    }

    this.checkTimer = setTimeout(async () => {
      try {
        await this.checkAndStartJobs();
      } catch (error) {
        console.error('Error checking jobs:', error);
        this.emit('error', error);
      } finally {
        this.scheduleJobCheck();
      }
    }, this.config.checkInterval);
  }

  private async checkAndStartJobs(): Promise<void> {
    if (this.activeJobs.size >= this.config.maxConcurrentJobs) {
      return;
    }

    const activeJobs = await this.repository.getAllActiveJobs();
    const availableSlots = this.config.maxConcurrentJobs - this.activeJobs.size;

    const sortedJobs = this.sortJobsForDistribution(activeJobs);

    let slotsUsed = 0;
    for (const job of sortedJobs) {
      if (slotsUsed >= availableSlots) {
        break;
      }

      if (this.shouldStartJob(job)) {
        const execution = await this.repository.tryLockJob(
          job.id,
          this.config.serverId,
          this.config.lockDuration
        );

        if (execution) {
          await this.startJobExecution(job, execution);
          slotsUsed++;
        }
      }
    }
  }

  private sortJobsForDistribution(jobs: CronJob[]): CronJob[] {
    return jobs.sort((a, b) => {
      const aHash = this.hashCode(a.name + this.config.serverId);
      const bHash = this.hashCode(b.name + this.config.serverId);
      return aHash - bHash;
    });
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private shouldStartJob(job: CronJob): boolean {
    const now = Date.now();
    const scheduleInterval = parseInt(job.schedule);

    const jobKey = `last_run_${job.id}`;
    const lastRun = this.getLastRunTime(jobKey);

    if (!lastRun || now - lastRun >= scheduleInterval) {
      this.setLastRunTime(jobKey, now);
      return true;
    }

    return false;
  }

  private lastRunTimes: Map<string, number> = new Map();

  private getLastRunTime(key: string): number | null {
    return this.lastRunTimes.get(key) || null;
  }

  private setLastRunTime(key: string, time: number): void {
    this.lastRunTimes.set(key, time);
  }

  private async startJobExecution(
    job: CronJob,
    execution: CronExecution
  ): Promise<void> {
    console.log(
      `🚀 Starting job '${job.name}' on server ${this.config.serverId}`
    );

    const lockExtensionTimeout = setTimeout(async () => {
      try {
        await this.repository.extendLock(execution.id, 60000);
      } catch (error) {
        console.error(`Error extending lock for job ${job.name}:`, error);
      }
    }, this.config.lockDuration - 30000);

    this.activeJobs.set(job.id, {
      execution,
      timeout: lockExtensionTimeout,
    });

    try {
      const result = await this.executor.executeJob(job, execution.id);

      await this.repository.completeExecution(
        execution.id,
        result,
        'completed'
      );
      console.log(
        `✅ Job '${job.name}' completed successfully on server ${this.config.serverId}`
      );

      this.emit('jobCompleted', { job, execution, result });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.repository.completeExecution(
        execution.id,
        errorMessage,
        'failed'
      );
      console.error(
        `❌ Job '${job.name}' failed on server ${this.config.serverId}:`,
        errorMessage
      );

      this.emit('jobFailed', { job, execution, error });
    } finally {
      clearTimeout(lockExtensionTimeout);
      this.activeJobs.delete(job.id);
    }
  }

  private generateServerId(): string {
    const hostname = require('os').hostname();
    const port = config.server.port;
    const random = Math.random().toString(36).substr(2, 8);
    return `${hostname}:${port}-${random}`;
  }

  getActiveJobsCount(): number {
    return this.activeJobs.size;
  }

  getServerId(): string {
    return this.config.serverId;
  }

  isServiceRunning(): boolean {
    return this.isRunning;
  }

  getConfig(): CronServiceConfig {
    return { ...this.config };
  }
}
