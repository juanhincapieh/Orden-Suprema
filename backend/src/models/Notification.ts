import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface NotificationAttributes {
  id: string;
  userId: string;
  type: 'transfer' | 'debt_request' | 'payment_request' | 'completion_request' | 'mission_assignment' | 'negotiation';
  senderId?: string;
  senderName?: string;
  amount?: number;
  message?: string;
  debtId?: string;
  missionId?: string;
  missionTitle?: string;
  missionReward?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
  read: boolean;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'senderId' | 'senderName' | 'amount' | 'message' | 'debtId' | 'missionId' | 'missionTitle' | 'missionReward' | 'status' | 'read'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  declare id: string;
  declare userId: string;
  declare type: 'transfer' | 'debt_request' | 'payment_request' | 'completion_request' | 'mission_assignment' | 'negotiation';
  declare senderId?: string;
  declare senderName?: string;
  declare amount?: number;
  declare message?: string;
  declare debtId?: string;
  declare missionId?: string;
  declare missionTitle?: string;
  declare missionReward?: number;
  declare status?: 'pending' | 'accepted' | 'rejected' | 'expired';
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
      type: DataTypes.ENUM('transfer', 'debt_request', 'payment_request', 'completion_request', 'mission_assignment', 'negotiation'),
      allowNull: false,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    senderName: {
      type: DataTypes.STRING,
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
    missionTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    missionReward: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'expired'),
      allowNull: true,
      defaultValue: 'pending',
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
