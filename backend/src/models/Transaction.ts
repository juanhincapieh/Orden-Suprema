import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TransactionAttributes {
  id: string;
  userId: string;
  type: 'purchase' | 'payment' | 'reward';
  amount: number;
  description: string;
  relatedMissionId?: string;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'relatedMissionId'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  declare id: string;
  declare userId: string;
  declare type: 'purchase' | 'payment' | 'reward';
  declare amount: number;
  declare description: string;
  declare relatedMissionId?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Transaction.init(
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
      type: DataTypes.ENUM('purchase', 'payment', 'reward'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    relatedMissionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
  }
);

export default Transaction;
