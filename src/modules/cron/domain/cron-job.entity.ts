import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../infrastructure/database/connection';

export interface CronJobAttributes {
  id: number;
  name: string;
  schedule: string;
  functionName: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CronJobCreationAttributes
  extends Optional<CronJobAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class CronJob
  extends Model<CronJobAttributes, CronJobCreationAttributes>
  implements CronJobAttributes
{
  public id!: number;
  public name!: string;
  public schedule!: string;
  public functionName!: string;
  public isActive!: boolean;
  public description?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

CronJob.init(
  {
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
    },
    functionName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'function_name',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'cron_jobs',
    timestamps: true,
    underscored: true,
  }
);
