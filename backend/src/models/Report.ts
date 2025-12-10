import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ReportAttributes {
  id: string;
  missionId: string;
  reporterId: string;
  description: string;
  status: 'pending' | 'resolved' | 'cancelled';
}

interface ReportCreationAttributes extends Optional<ReportAttributes, 'id' | 'status'> {}

class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  declare id: string;
  declare missionId: string;
  declare reporterId: string;
  declare description: string;
  declare status: 'pending' | 'resolved' | 'cancelled';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Report.init(
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
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'resolved', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
  }
);

export default Report;
