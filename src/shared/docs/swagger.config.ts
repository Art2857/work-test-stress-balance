import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import { getApiUrl, config } from '../../config';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Balance Management API',
      version: '1.0.0',
      description: 'Simple API для управления балансами пользователей',
    },
    servers: [
      {
        url: getApiUrl(),
        description: config.server.isDevelopment
          ? 'Development server'
          : 'Production server',
      },
    ],
    components: {
      schemas: {
        UpdateBalanceRequest: {
          type: 'object',
          required: ['userId', 'amount'],
          properties: {
            userId: {
              type: 'integer',
              minimum: 1,
              example: 1,
              description: 'ID пользователя',
            },
            amount: {
              type: 'number',
              example: -2.0,
              description:
                'Сумма для изменения баланса (может быть отрицательной)',
            },
          },
        },
        SetBalanceRequest: {
          type: 'object',
          required: ['userId', 'balance'],
          properties: {
            userId: {
              type: 'integer',
              minimum: 1,
              example: 1,
              description: 'ID пользователя',
            },
            balance: {
              type: 'number',
              minimum: 0,
              example: 5000.0,
              description: 'Новое значение баланса',
            },
          },
        },
        UpdateBalanceResponse: {
          type: 'object',
          required: ['success', 'userId', 'balance'],
          properties: {
            success: {
              type: 'boolean',
              example: true,
              description: 'Статус успешности операции',
            },
            userId: {
              type: 'integer',
              example: 1,
              description: 'ID пользователя',
            },
            balance: {
              type: 'number',
              example: 9998.0,
              description: 'Новый баланс пользователя',
            },
          },
        },
        GetBalanceResponse: {
          type: 'object',
          required: ['userId', 'balance'],
          properties: {
            userId: {
              type: 'integer',
              example: 1,
              description: 'ID пользователя',
            },
            balance: {
              type: 'number',
              example: 10000.0,
              description: 'Текущий баланс пользователя',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['error', 'statusCode'],
          properties: {
            error: {
              type: 'string',
              example: 'User not found',
              description: 'Описание ошибки',
            },
            statusCode: {
              type: 'integer',
              example: 404,
              description: 'HTTP статус код',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          required: ['status', 'timestamp'],
          properties: {
            status: {
              type: 'string',
              example: 'OK',
              description: 'Статус приложения',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2023-12-07T10:30:00.000Z',
              description: 'Время проверки',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Неверный запрос - ошибка валидации',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Validation failed: userId must be a positive integer',
                statusCode: 400,
              },
            },
          },
        },
        NotFound: {
          description: 'Ресурс не найден',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'User not found',
                statusCode: 404,
              },
            },
          },
        },
        InternalServerError: {
          description: 'Внутренняя ошибка сервера',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Internal server error',
                statusCode: 500,
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/modules/user/api/*.ts', './src/application.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
