import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.createTable('cron_executions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cron_jobs',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    server_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Идентификатор сервера (hostname + port + random)',
    },
    status: {
      type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Длительность выполнения в миллисекундах',
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Результат выполнения или сообщение об ошибке',
    },
    lock_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Время истечения блокировки задачи',
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

  await queryInterface.addIndex('cron_executions', ['job_id'], {
    name: 'idx_cron_executions_job_id',
  });

  await queryInterface.addIndex('cron_executions', ['server_id'], {
    name: 'idx_cron_executions_server_id',
  });

  await queryInterface.addIndex('cron_executions', ['status'], {
    name: 'idx_cron_executions_status',
  });

  await queryInterface.addIndex('cron_executions', ['lock_expires_at'], {
    name: 'idx_cron_executions_lock_expires_at',
  });

  await queryInterface.addIndex('cron_executions', ['created_at'], {
    name: 'idx_cron_executions_created_at',
  });

  await queryInterface.addIndex(
    'cron_executions',
    ['job_id', 'status', 'lock_expires_at'],
    {
      name: 'idx_cron_executions_active_jobs',
    }
  );
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('cron_executions');
};
