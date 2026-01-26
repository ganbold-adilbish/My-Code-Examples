import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { initBookModel } from './Book';
import { initUserModel } from './User';
import { initAuthorModel } from './Author';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'graphql_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const BookModel = initBookModel(sequelize);
const UserModel = initUserModel(sequelize);
const AuthorModel = initAuthorModel(sequelize);

// Associations
// User has one Author profile
UserModel.hasOne(AuthorModel, { foreignKey: 'user_id', as: 'authorProfile' });
AuthorModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Author writes many Books
AuthorModel.hasMany(BookModel, { foreignKey: 'author_id', as: 'books' });
BookModel.belongsTo(AuthorModel, { foreignKey: 'author_id', as: 'author' });

export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message);
    return false;
  }
}

export async function syncDatabase(): Promise<void> {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');

    const userCount = await UserModel.count();
    if (userCount === 0) {
      // 1. Create Users
      const users = await UserModel.bulkCreate([
        { name: 'Alice Johnson', email: 'alice@example.com' }, // Reader
        { name: 'Bob Smith', email: 'bob@example.com' }, // Reader
        { name: 'George Orwell', email: 'george@orwell.com' }, // Author
        { name: 'Harper Lee', email: 'harper@lee.com' }, // Author
        { name: 'F. Scott Fitzgerald', email: 'scott@fitzgerald.com' }, // Author
      ]);
      console.log('✅ Sample users inserted');

      // 2. Create Authors (for the last 3 users)
      const authors = await AuthorModel.bulkCreate([
        {
          user_id: users[2].id,
          bio: 'English novelist and essayist, journalist and critic.',
        },
        {
          user_id: users[3].id,
          bio: 'American novelist best known for To Kill a Mockingbird.',
        },
        {
          user_id: users[4].id,
          bio: 'American novelist, essayist, and short story writer.',
        },
      ]);
      console.log('✅ Sample authors inserted');

      // 3. Create Books (linked to Authors)
      await BookModel.bulkCreate([
        {
          title: '1984',
          author_id: authors[0].id,
          year: 1949,
        },
        {
          title: 'To Kill a Mockingbird',
          author_id: authors[1].id,
          year: 1960,
        },
        {
          title: 'The Great Gatsby',
          author_id: authors[2].id,
          year: 1925,
        },
      ]);
      console.log('✅ Sample books inserted');
    }
  } catch (error) {
    console.error('❌ Database sync error:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
}

export { sequelize, BookModel, UserModel, AuthorModel };
