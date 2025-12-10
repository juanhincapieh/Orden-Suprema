import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ReviewAttributes {
  id: string;
  missionId: string;
  reviewerId: string;
  rating: number;
  comment: string;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'comment'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  declare id: string;
  declare missionId: string;
  declare reviewerId: string;
  declare rating: number;
  declare comment: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Review.init(
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
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
  }
);

export default Review;
