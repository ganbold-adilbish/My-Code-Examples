import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface BookAttributes {
  id: number;
  title: string;
  // Foreign key to Author
  author_id: number;
  year: number;
  created_at?: Date;
  updated_at?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BookCreationAttributes extends Optional<
  BookAttributes,
  'id' | 'created_at' | 'updated_at'
> {}

export class BookModel
  extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes
{
  public id!: number;
  public title!: string;
  public author_id!: number;
  public year!: number;
  public created_at?: Date;
  public updated_at?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initBookModel(sequelize: Sequelize): typeof BookModel {
  BookModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Title cannot be empty',
          },
          len: {
            args: [1, 255],
            msg: 'Title must be between 1 and 255 characters',
          },
        },
      },
      author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'authors',
          key: 'id',
        },
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: 'Year must be an integer',
          },
          min: {
            args: [1000],
            msg: 'Year must be at least 1000',
          },
          max: {
            args: [new Date().getFullYear() + 10],
            msg: 'Year cannot be too far in the future',
          },
        },
      },
    },
    {
      sequelize,
      tableName: 'books',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return BookModel;
}
