import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  try {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_id_unique 
      ON users (id);
    `);
  } catch (error) {
    console.log(error);
  }

  try {
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_balance_operations 
      ON users (id) 
      INCLUDE (balance, "updatedAt")
      WHERE balance >= 0;
    `);
  } catch {
    try {
      await queryInterface.sequelize.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_balance_fallback 
        ON users (id, balance, "updatedAt") 
        WHERE balance >= 0;
      `);
    } catch (error) {
      console.log(error);
    }
  }

  try {
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active 
      ON users (id) 
      WHERE balance > 0;
    `);
  } catch (error) {
    console.log(error);
  }

  try {
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_updated_at 
      ON users ("updatedAt" DESC);
    `);
  } catch (error) {
    console.log(error);
  }

  try {
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_analytics 
      ON users (balance, "createdAt", "updatedAt");
    `);
  } catch (error) {
    console.log(error);
  }

  try {
    await queryInterface.sequelize.query('ANALYZE users;');
  } catch (error) {
    console.log(error);
  }
};

export const down = async (queryInterface: QueryInterface) => {
  const indexesToDrop = [
    'idx_users_id_unique',
    'idx_users_balance_operations',
    'idx_users_balance_fallback',
    'idx_users_active',
    'idx_users_updated_at',
    'idx_users_analytics',
  ];

  for (const indexName of indexesToDrop) {
    try {
      await queryInterface.sequelize.query(
        `DROP INDEX CONCURRENTLY IF EXISTS ${indexName};`
      );
    } catch (error) {
      console.log(error);
    }
  }
};
