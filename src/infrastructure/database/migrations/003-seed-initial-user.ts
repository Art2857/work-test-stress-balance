import { QueryInterface, QueryTypes } from 'sequelize';
import { config } from '../../../config';

export const up = async (queryInterface: QueryInterface) => {
  const existingUsers = await queryInterface.sequelize.query(
    'SELECT COUNT(*) as count FROM users;',
    { type: QueryTypes.SELECT }
  );

  const count = (existingUsers as any)[0].count;

  if (parseInt(count) === 0) {
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        balance: config.app.initialUserBalance,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete('users', { id: 1 });
};
