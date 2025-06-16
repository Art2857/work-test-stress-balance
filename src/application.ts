import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { connectToDatabase, runMigrations } from './infrastructure';
import { createUserRoutes } from './modules/user';
import { createUserModuleWithDependencies } from './modules/user/user.factory';
import { swaggerSpec } from './shared/docs/swagger.config';
import { errorHandler } from './shared/middleware/error-handler.middleware';
import { config } from './config';

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Проверка состояния приложения
 *     description: Возвращает информацию о состоянии приложения и времени проверки
 *     responses:
 *       200:
 *         description: Приложение работает нормально
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

export async function createApplication() {
  const app = express();

  app.use(express.json());

  if (config.app.swaggerEnabled) {
    app.use(
      config.app.swaggerPath,
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Balance Management API',
      })
    );
  }

  await connectToDatabase();
  await runMigrations();

  const { userController: userBalanceController } =
    createUserModuleWithDependencies();

  app.use('/api', createUserRoutes(userBalanceController));

  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(errorHandler);

  return app;
}
