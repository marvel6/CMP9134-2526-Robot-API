import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';
import { sequelize } from '../sequelize';
import { User } from './User';

export type ActionEnum = 'COMMAND' | 'LOGIN' | 'RESET_ROBOT';

export class AuditLog extends Model<InferAttributes<AuditLog>, InferCreationAttributes<AuditLog>> {
  declare id: CreationOptional<string>;
  declare action: ActionEnum;
  declare navigation_direction: string | null;
  declare user_id: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    action: {
      type: DataTypes.ENUM('COMMAND', 'LOGIN', 'RESET_ROBOT'),
      allowNull: false,
    },
    navigation_direction: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onDelete: 'CASCADE',
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
  },
  {
    sequelize,
    tableName: 'auditlog',
    modelName: 'AuditLog',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'audit_logs', onDelete: 'CASCADE' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
