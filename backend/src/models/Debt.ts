import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DebtAttributes {
  id: string;
  debtorId: string;
  creditorId: string;
  favorDescription: string;
  paymentDescription?: string;
  status: 'pending' | 'active' | 'payment_requested' | 'in_progress' | 'completed' | 'rejected';
}

interface DebtCreationAttributes extends Optional<DebtAttributes, 'id' | 'paymentDescription' | 'status'> {}

class Debt extends Model<DebtAttributes, DebtCreationAttributes> implements DebtAttributes {
  declare id: string;
  declare debtorId: string;
  declare creditorId: string;
  declare favorDescription: string;
  declare paymentDescription?: string;
  declare status: 'pending' | 'active' | 'payment_requested' | 'in_progress' | 'completed' | 'rejected';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Debt.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    debtorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    creditorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    favorDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    paymentDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'payment_requested', 'in_progress', 'completed', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'Debt',
    tableName: 'debts',
  }
);

export default Debt;
