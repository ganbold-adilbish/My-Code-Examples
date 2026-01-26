import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface AuthorAttributes {
  id: number;
  // Foreign key to User
  user_id: number;
  bio: string;
  website?: string;
  created_at?: Date;
  updated_at?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AuthorCreationAttributes extends Optional<
  AuthorAttributes,
  'id' | 'website' | 'created_at' | 'updated_at'
> {}

export class AuthorModel
  extends Model<AuthorAttributes, AuthorCreationAttributes>
  implements AuthorAttributes
{
  public id!: number;
  public user_id!: number;
  public bio!: string;
  public website?: string;
  public created_at?: Date;
  public updated_at?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initAuthorModel(sequelize: Sequelize): typeof AuthorModel {
  AuthorModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // One-to-One relationship with User
        references: {
          model: 'users',
          key: 'id',
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Bio cannot be empty',
          },
        },
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: {
            msg: 'Must be a valid URL',
          },
        },
      },
    },
    {
      sequelize,
      tableName: 'authors',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return AuthorModel;
}
