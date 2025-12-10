import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface NegotiationAttributes {
  id: string;
  missionId: string;
  proposedBy: 'contractor' | 'assassin';
  proposedById: string;
  proposedReward: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  respondedAt?: Date;
}

interface NegotiationCreationAttributes extends Optional<NegotiationAttributes, 'id' | 'status' | 'respondedAt'> {}

class Negotiation extends Model<NegotiationAttributes, NegotiationCreationAttributes> implements NegotiationAttributes {
  declare id: string;
  declare missionId: string;
  declare proposedBy: 'contractor' | 'assassin';
  declare proposedById: string;
  declare proposedReward: number;
  declare message: string;
  declare status: 'pending' | 'accepted' | 'rejected';
  declare respondedAt?: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Negotiation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    missionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    proposedBy: {
      type: DataTypes.ENUM('contractor', 'assassin'),
      allowNull: false,
    },
    proposedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    proposedReward: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Negotiation',
    tableName: 'negotiations',
  }
);

export default Negotiation;
