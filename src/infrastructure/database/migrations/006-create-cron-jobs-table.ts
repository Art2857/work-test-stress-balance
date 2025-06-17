import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.createTable('cron_jobs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    schedule: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Интервал выполнения в миллисекундах',
    },
    function_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Имя функции для выполнения',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.bulkInsert('cron_jobs', [
    {
      name: 'data_cleanup_task',
      schedule: '300000',
      function_name: 'dataCleanupJob',
      description: 'Очистка устаревших данных',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'report_generation_task',
      schedule: '600000',
      function_name: 'reportGenerationJob',
      description: 'Генерация отчетов',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'backup_task',
      schedule: '900000',
      function_name: 'backupJob',
      description: 'Создание резервных копий',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'notification_task',
      schedule: '180000',
      function_name: 'notificationJob',
      description: 'Отправка уведомлений',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'analytics_task',
      schedule: '420000',
      function_name: 'analyticsJob',
      description: 'Обработка аналитических данных',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('cron_jobs');
};
