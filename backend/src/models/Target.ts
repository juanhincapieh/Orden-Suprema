import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TargetAttributes {
  id: string;
  targetUserId: string;
  debtId: string;
  reason: string;
  markedAt: Date;
}

interface TargetCreationAttributes extends Optional<TargetAttributes, 'id' | 'markedAt'> {}

class Target extends Model<TargetAttributes, TargetCreationAttributes> implements TargetAttributes {
  declare id: string;
  declare targetUserId: string;
  declare debtId: string;
  declare reason: string;
  declare markedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Target.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    targetUserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    debtId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    markedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Target',
    tableName: 'targets',
  }
);

export default Target;
