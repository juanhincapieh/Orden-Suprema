import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AssassinProfileAttributes {
  id: string;
  userId: string;
  minContractValue: number;
  specialties: string[];
  status: 'available' | 'busy' | 'inactive';
  locationLat?: number;
  locationLng?: number;
  address?: string;
  useAutoLocation: boolean;
}

interface AssassinProfileCreationAttributes extends Optional<AssassinProfileAttributes, 'id' | 'minContractValue' | 'specialties' | 'status' | 'locationLat' | 'locationLng' | 'address' | 'useAutoLocation'> {}

class AssassinProfile extends Model<AssassinProfileAttributes, AssassinProfileCreationAttributes> implements AssassinProfileAttributes {
  declare id: string;
  declare userId: string;
  declare minContractValue: number;
  declare specialties: string[];
  declare status: 'available' | 'busy' | 'inactive';
  declare locationLat?: number;
  declare locationLng?: number;
  declare address?: string;
  declare useAutoLocation: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  get location() {
    if (this.locationLat && this.locationLng) {
      return { lat: this.locationLat, lng: this.locationLng };
    }
    return null;
  }
}

AssassinProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    minContractValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    specialties: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('available', 'busy', 'inactive'),
      allowNull: false,
      defaultValue: 'available',
    },
    locationLat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    locationLng: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    useAutoLocation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'AssassinProfile',
    tableName: 'assassin_profiles',
  }
);

export default AssassinProfile;
