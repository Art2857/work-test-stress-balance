import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../infrastructure/database/connection';
import { CronJob } from './cron-job.entity';

export type CronExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export interface CronExecutionAttributes {
  id: number;
  jobId: number;
  serverId: string;
  status: CronExecutionStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  result?: string;
  lockExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CronExecutionCreationAttributes
  extends Optional<CronExecutionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class CronExecution
  extends Model<CronExecutionAttributes, CronExecutionCreationAttributes>
  implements CronExecutionAttributes
{
  public id!: number;
  public jobId!: number;
  public serverId!: string;
  public status!: CronExecutionStatus;
  public startedAt?: Date;
  public completedAt?: Date;
  public duration?: number;
  public result?: string;
  public lockExpiresAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  public cronJob?: CronJob;
}

CronExecution.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'job_id',
      references: {
        model: CronJob,
        key: 'id',
      },
    },
    serverId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'server_id',
    },
    status: {
      type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lockExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lock_expires_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'cron_executions',
    timestamps: true,
    underscored: true,
  }
);

CronExecution.belongsTo(CronJob, {
  foreignKey: 'jobId',
  as: 'cronJob',
});

CronJob.hasMany(CronExecution, {
  foreignKey: 'jobId',
  as: 'executions',
});
