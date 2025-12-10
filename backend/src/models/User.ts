import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  nickname: string;
  role: 'admin' | 'contractor' | 'assassin';
  avatar?: string;
  coins: number;
  suspended: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'avatar' | 'coins' | 'suspended'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare name: string;
  declare nickname: string;
  declare role: 'admin' | 'contractor' | 'assassin';
  declare avatar?: string;
  declare coins: number;
  declare suspended: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      nickname: this.nickname,
      role: this.role,
      avatar: this.avatar,
      coins: this.coins,
      createdAt: this.createdAt,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'contractor', 'assassin'),
      allowNull: false,
      defaultValue: 'contractor',
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
    },
    suspended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

export default User;
