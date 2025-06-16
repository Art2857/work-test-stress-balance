import { Sequelize } from 'sequelize';
import { config } from '../../config';

const databaseConnection = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: config.database.options.logging,
  pool: config.database.pool,
  dialectOptions: {
    statement_timeout: config.database.query.statementTimeout,
    idle_in_transaction_session_timeout:
      config.database.query.idleTransactionTimeout,
  },
  retry: config.database.retry,
  isolationLevel: config.database.options.isolationLevel,
  define: config.database.options.define,
  benchmark: config.database.options.benchmark,
});

export async function connectToDatabase(): Promise<void> {
  try {
    await databaseConnection.authenticate();
    console.log('✅ Database connection established successfully.');

    const connectionPool = (databaseConnection.connectionManager as any).pool;
    if (connectionPool) {
      console.log(
        `📊 Connection pool: max=${connectionPool.options?.max || 'unknown'}, min=${connectionPool.options?.min || 'unknown'}`
      );
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

connectToDatabase().catch(console.error);

export { databaseConnection as sequelize };
