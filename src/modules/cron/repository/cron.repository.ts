import { Op, Transaction, QueryTypes } from 'sequelize';
import { sequelize } from '../../../infrastructure/database/connection';
import { CronJob } from '../domain/cron-job.entity';
import {
  CronExecution,
  CronExecutionStatus,
} from '../domain/cron-execution.entity';

export interface JobExecutionInfo {
  jobId: number;
  jobName: string;
  functionName: string;
  serverId: string;
  status: CronExecutionStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  result?: string;
  executionId: number;
  description?: string;
  schedule: string;
}

export class CronRepository {
  async getAllActiveJobs(): Promise<CronJob[]> {
    return CronJob.findAll({
      where: {
        isActive: true,
      },
      order: [['id', 'ASC']],
    });
  }

  async getJobById(id: number): Promise<CronJob | null> {
    return CronJob.findByPk(id);
  }

  async getJobByName(name: string): Promise<CronJob | null> {
    return CronJob.findOne({
      where: { name },
    });
  }

  async tryLockJob(
    jobId: number,
    serverId: string,
    lockDurationMs: number = 150000
  ): Promise<CronExecution | null> {
    const transaction = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    });

    try {
      const existingLock = await CronExecution.findOne({
        where: {
          jobId,
          status: 'running',
          lockExpiresAt: {
            [Op.gt]: new Date(),
          },
        },
        transaction,
      });

      if (existingLock) {
        await transaction.rollback();
        return null;
      }

      await this.cleanupExpiredLocks(transaction);

      const lockExpiresAt = new Date(Date.now() + lockDurationMs);
      const execution = await CronExecution.create(
        {
          jobId,
          serverId,
          status: 'running',
          startedAt: new Date(),
          lockExpiresAt,
        },
        { transaction }
      );

      await transaction.commit();
      return execution;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async completeExecution(
    executionId: number,
    result: string,
    status: 'completed' | 'failed' = 'completed'
  ): Promise<void> {
    const completedAt = new Date();
    const execution = await CronExecution.findByPk(executionId);

    if (!execution) {
      throw new Error(`Execution with id ${executionId} not found`);
    }

    const duration = execution.startedAt
      ? completedAt.getTime() - execution.startedAt.getTime()
      : 0;

    await execution.update({
      status,
      completedAt,
      duration,
      result,
      lockExpiresAt: undefined,
    });
  }

  async extendLock(
    executionId: number,
    additionalMs: number = 60000
  ): Promise<boolean> {
    const execution = await CronExecution.findByPk(executionId);

    if (!execution || execution.status !== 'running') {
      return false;
    }

    const newLockExpiresAt = new Date(Date.now() + additionalMs);
    await execution.update({
      lockExpiresAt: newLockExpiresAt,
    });

    return true;
  }

  async getAllJobsWithStatus(): Promise<JobExecutionInfo[]> {
    const results = (await sequelize.query(
      `
      SELECT 
        cj.id as job_id,
        cj.name as job_name,
        cj.function_name,
        cj.description,
        cj.schedule,
        ce.id as execution_id,
        ce.server_id,
        ce.status,
        ce.started_at,
        ce.completed_at,
        ce.duration,
        ce.result
      FROM cron_jobs cj
      LEFT JOIN LATERAL (
        SELECT * FROM cron_executions ce2 
        WHERE ce2.job_id = cj.id 
        AND ce2.status IN ('running', 'pending')
        ORDER BY ce2.created_at DESC 
        LIMIT 1
      ) ce ON true
      WHERE cj.is_active = true
      ORDER BY cj.id
    `,
      {
        type: QueryTypes.SELECT,
      }
    )) as any[];

    return results.map(row => ({
      jobId: row.job_id,
      jobName: row.job_name,
      functionName: row.function_name,
      description: row.description,
      schedule: row.schedule,
      executionId: row.execution_id,
      serverId: row.server_id,
      status: row.status || 'idle',
      startedAt: row.started_at,
      completedAt: row.completed_at,
      duration: row.duration,
      result: row.result,
    }));
  }

  async getExecutionHistory(
    limit: number = 100,
    offset: number = 0
  ): Promise<CronExecution[]> {
    return CronExecution.findAll({
      include: [
        {
          model: CronJob,
          as: 'cronJob',
          attributes: ['name', 'description', 'functionName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  private async cleanupExpiredLocks(transaction?: Transaction): Promise<void> {
    await CronExecution.update(
      {
        status: 'failed',
        result: 'Lock expired - execution timed out',
        completedAt: new Date(),
        lockExpiresAt: undefined,
      },
      {
        where: {
          status: 'running',
          lockExpiresAt: {
            [Op.lt]: new Date(),
          },
        },
        transaction,
      }
    );
  }

  async cleanupOldExecutions(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await CronExecution.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
        status: {
          [Op.in]: ['completed', 'failed'],
        },
      },
    });

    return result;
  }

  async getServerJobDistribution(): Promise<
    { serverId: string; jobCount: number }[]
  > {
    const results = (await sequelize.query(
      `
      SELECT 
        server_id,
        COUNT(*) as job_count
      FROM cron_executions
      WHERE status = 'running'
        AND lock_expires_at > NOW()
      GROUP BY server_id
      ORDER BY job_count DESC
    `,
      {
        type: QueryTypes.SELECT,
      }
    )) as any[];

    return results.map(row => ({
      serverId: row.server_id,
      jobCount: parseInt(row.job_count),
    }));
  }
}
