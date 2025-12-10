import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MissionAttributes {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'negotiating';
  terminado: boolean;
  contractorId: string;
  assassinId?: string;
  isPrivate: boolean;
  targetAssassinId?: string;
  location?: string;
  deadline?: string;
}

interface MissionCreationAttributes extends Optional<MissionAttributes, 'id' | 'status' | 'terminado' | 'assassinId' | 'isPrivate' | 'targetAssassinId' | 'location' | 'deadline'> {}

class Mission extends Model<MissionAttributes, MissionCreationAttributes> implements MissionAttributes {
  declare id: string;
  declare title: string;
  declare description: string;
  declare reward: number;
  declare status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'negotiating';
  declare terminado: boolean;
  declare contractorId: string;
  declare assassinId?: string;
  declare isPrivate: boolean;
  declare targetAssassinId?: string;
  declare location?: string;
  declare deadline?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Mission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled', 'negotiating'),
      allowNull: false,
      defaultValue: 'open',
    },
    terminado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    contractorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assassinId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    targetAssassinId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deadline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Mission',
    tableName: 'missions',
  }
);

export default Mission;
