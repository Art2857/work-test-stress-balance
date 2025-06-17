import 'dotenv/config';
import { z } from 'zod';
import { Transaction } from 'sequelize';

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().min(1000).max(65535).default(3000),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://postgres:postgres@localhost:5433/webapp_test'),
  SWAGGER_ENABLED: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .default('true'),
});

function validateEnvironment() {
  try {
    return environmentSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error);
    process.exit(1);
  }
}

const env = validateEnvironment();

export const config = {
  server: {
    port: env.PORT,
    isDevelopment: env.NODE_ENV === 'development',
  },

  database: {
    url: env.DATABASE_URL,
    pool: {
      max: 200,
      min: 50,
      acquire: 60000,
      idle: 5000,
      evict: 1000,
    },
    query: {
      statementTimeout: 30000,
      idleTransactionTimeout: 10000,
    },
    retry: {
      max: 3,
      timeout: 5000,
    },
    options: {
      logging: false,
      benchmark: env.NODE_ENV === 'development',
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true,
      },
    },
  },

  app: {
    swaggerEnabled: env.SWAGGER_ENABLED,
    swaggerPath: '/api-docs',
    initialUserBalance: 10000,
  },
};

export function getApiUrl(): string {
  return `http://localhost:${config.server.port}`;
}
