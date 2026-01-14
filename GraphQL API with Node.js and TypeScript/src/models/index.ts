import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { initBookModel } from './Book';
import { initUserModel } from './User';

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
      idle: 10000
    }
  }
);

const BookModel = initBookModel(sequelize);
const UserModel = initUserModel(sequelize);

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
    
    const bookCount = await BookModel.count();
    if (bookCount === 0) {
      await BookModel.bulkCreate([
        { title: '1984', author: 'George Orwell', year: 1949 },
        { title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },
        { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 }
      ]);
      console.log('✅ Sample books inserted');
    }
    
    const userCount = await UserModel.count();
    if (userCount === 0) {
      await UserModel.bulkCreate([
        { name: 'Alice Johnson', email: 'alice@example.com' },
        { name: 'Bob Smith', email: 'bob@example.com' }
      ]);
      console.log('✅ Sample users inserted');
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

export { sequelize, BookModel, UserModel };