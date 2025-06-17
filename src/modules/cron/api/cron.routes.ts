import express from 'express';
import { CronController } from './cron.controller';

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
 *                     type: object
 *                     properties:
 *                       jobId:
 *                         type: integer
 *                         example: 1
 *                       jobName:
 *                         type: string
 *                         example: "data_cleanup_task"
 *                       functionName:
 *                         type: string
 *                         example: "dataCleanupJob"
 *                       serverId:
 *                         type: string
 *                         example: "server-01:3000-abc123"
 *                       status:
 *                         type: string
 *                         enum: [running, idle, completed, failed]
 *                         example: "running"
 *                       runtimeSeconds:
 *                         type: integer
 *                         nullable: true
 *                         example: 120
 *                       isRunning:
 *                         type: boolean
 *                         example: true
 *                       isIdle:
 *                         type: boolean
 *                         example: false
 *                 serverId:
 *                   type: string
 *                   example: "server-01:3000-abc123"
 *                 activeJobsCount:
 *                   type: integer
 *                   example: 2
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

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

export function createCronRoutes(cronController: CronController) {
  const router = express.Router();

  router.get('/jobs', cronController.getAllJobs.bind(cronController));

  router.get(
    '/jobs/:jobId/history',
    cronController.getJobHistory.bind(cronController)
  );

  router.get(
    '/executions',
    cronController.getExecutionHistory.bind(cronController)
  );

  router.get(
    '/servers',
    cronController.getServerDistribution.bind(cronController)
  );

  router.get('/stats', cronController.getStats.bind(cronController));

  return router;
}
