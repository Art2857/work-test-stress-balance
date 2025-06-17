import { Request, Response } from 'express';
import {
  CronRepository,
  JobExecutionInfo,
} from '../repository/cron.repository';
import { CronService } from '../services/cron.service';

export class CronController {
  constructor(
    private cronRepository: CronRepository,
    private cronService: CronService
  ) {}

  /**
   * @swagger
   * /api/cron/jobs:
   *   get:
   *     tags:
   *       - Cron Jobs
   *     summary: Получить список всех задач с их статусом
   *     description: Возвращает список всех активных cron-задач с информацией о текущем статусе выполнения
   *     responses:
   *       200:
   *         description: Список задач успешно получен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/JobStatusInfo'
   *                 serverId:
   *                   type: string
   *                   example: "server-01:3000-abc123"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getAllJobs(req: Request, res: Response): Promise<void> {
    try {
      const jobs = await this.cronRepository.getAllJobsWithStatus();

      const jobsWithRuntime = jobs.map(job => ({
        ...job,
        runtimeSeconds: this.calculateRuntime(job),
        isRunning: job.status === 'running',
        isIdle:
          !job.executionId ||
          job.status === 'completed' ||
          job.status === 'failed',
      }));

      res.json({
        success: true,
        data: jobsWithRuntime,
        serverId: this.cronService.getServerId(),
        activeJobsCount: this.cronService.getActiveJobsCount(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get jobs',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /api/cron/jobs/{jobId}/history:
   *   get:
   *     tags:
   *       - Cron Jobs
   *     summary: Получить историю выполнения конкретной задачи
   *     parameters:
   *       - in: path
   *         name: jobId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID задачи
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Количество записей для получения
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Смещение для пагинации
   *     responses:
   *       200:
   *         description: История выполнения получена
   *       404:
   *         description: Задача не найдена
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getJobHistory(req: Request, res: Response): Promise<void> {
    try {
      const jobId = parseInt(req.params.jobId);
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (isNaN(jobId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid job ID',
        });
        return;
      }

      const job = await this.cronRepository.getJobById(jobId);
      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found',
        });
        return;
      }

      const history = await this.cronRepository.getExecutionHistory(
        limit,
        offset
      );
      const jobHistory = history.filter(execution => execution.jobId === jobId);

      res.json({
        success: true,
        data: {
          job: {
            id: job.id,
            name: job.name,
            description: job.description,
            functionName: job.functionName,
            schedule: job.schedule,
          },
          executions: jobHistory.map(execution => ({
            id: execution.id,
            serverId: execution.serverId,
            status: execution.status,
            startedAt: execution.startedAt,
            completedAt: execution.completedAt,
            duration: execution.duration,
            result: execution.result,
            createdAt: execution.createdAt,
          })),
          pagination: {
            limit,
            offset,
            total: jobHistory.length,
          },
        },
      });
    } catch (error) {
      console.error('Error getting job history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get job history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /api/cron/executions:
   *   get:
   *     tags:
   *       - Cron Jobs
   *     summary: Получить общую историю выполнения всех задач
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *         description: Количество записей для получения
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Смещение для пагинации
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, running, completed, failed]
   *         description: Фильтр по статусу
   *     responses:
   *       200:
   *         description: История выполнения получена
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getExecutionHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string;

      const executions = await this.cronRepository.getExecutionHistory(
        limit,
        offset
      );

      let filteredExecutions = executions;
      if (status) {
        filteredExecutions = executions.filter(
          execution => execution.status === status
        );
      }

      res.json({
        success: true,
        data: filteredExecutions.map(execution => ({
          id: execution.id,
          job: execution.cronJob
            ? {
                id: execution.jobId,
                name: execution.cronJob.name,
                description: execution.cronJob.description,
                functionName: execution.cronJob.functionName,
              }
            : null,
          serverId: execution.serverId,
          status: execution.status,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          duration: execution.duration,
          result: execution.result,
          createdAt: execution.createdAt,
        })),
        pagination: {
          limit,
          offset,
          total: filteredExecutions.length,
          filtered: !!status,
          filter: status || null,
        },
      });
    } catch (error) {
      console.error('Error getting execution history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get execution history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /api/cron/servers:
   *   get:
   *     tags:
   *       - Cron Jobs
   *     summary: Получить информацию о распределении задач по серверам
   *     responses:
   *       200:
   *         description: Информация о серверах получена
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getServerDistribution(req: Request, res: Response): Promise<void> {
    try {
      const distribution = await this.cronRepository.getServerJobDistribution();
      const currentServerId = this.cronService.getServerId();
      const currentServerJobs = this.cronService.getActiveJobsCount();

      res.json({
        success: true,
        data: {
          currentServer: {
            serverId: currentServerId,
            activeJobs: currentServerJobs,
            isActive: this.cronService.isServiceRunning(),
          },
          allServers: distribution,
          totalActiveJobs: distribution.reduce(
            (sum, server) => sum + server.jobCount,
            0
          ),
          totalServers: distribution.length,
        },
      });
    } catch (error) {
      console.error('Error getting server distribution:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get server distribution',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /api/cron/stats:
   *   get:
   *     tags:
   *       - Cron Jobs
   *     summary: Получить общую статистику по задачам
   *     responses:
   *       200:
   *         description: Статистика получена
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [jobs, distribution] = await Promise.all([
        this.cronRepository.getAllJobsWithStatus(),
        this.cronRepository.getServerJobDistribution(),
      ]);

      const stats = {
        totalJobs: jobs.length,
        runningJobs: jobs.filter(job => job.status === 'running').length,
        idleJobs: jobs.filter(
          job =>
            !job.executionId ||
            job.status === 'completed' ||
            job.status === 'failed'
        ).length,
        failedJobs: jobs.filter(job => job.status === 'failed').length,
        totalServers: distribution.length,
        currentServer: {
          serverId: this.cronService.getServerId(),
          activeJobs: this.cronService.getActiveJobsCount(),
          maxConcurrentJobs: this.cronService.getConfig().maxConcurrentJobs,
        },
        lastUpdated: new Date().toISOString(),
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private calculateRuntime(job: JobExecutionInfo): number | null {
    if (!job.startedAt || job.status !== 'running') {
      return null;
    }

    const now = new Date();
    const startTime = new Date(job.startedAt);
    return Math.floor((now.getTime() - startTime.getTime()) / 1000);
  }
}
