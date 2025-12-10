import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface NotificationAttributes {
  id: string;
  userId: string;
  type: 'transfer' | 'debt_request' | 'payment_request' | 'completion_request' | 'mission_assigned' | 'negotiation';
  senderId?: string;
  amount?: number;
  message?: string;
  debtId?: string;
  missionId?: string;
  read: boolean;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'senderId' | 'amount' | 'message' | 'debtId' | 'missionId' | 'read'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  declare id: string;
  declare userId: string;
  declare type: 'transfer' | 'debt_request' | 'payment_request' | 'completion_request' | 'mission_assigned' | 'negotiation';
  declare senderId?: string;
  declare amount?: number;
  declare message?: string;
  declare debtId?: string;
  declare missionId?: string;
  declare read: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('transfer', 'debt_request', 'payment_request', 'completion_request', 'mission_assigned', 'negotiation'),
      allowNull: false,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    debtId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    missionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
  }
);

export default Notification;
