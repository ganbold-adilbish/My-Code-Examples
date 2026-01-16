import { Sequelize } from 'sequelize';
import { initBookModel } from '../../models/Book';
import { initUserModel } from '../../models/User';

// Test database configuration
export const createTestDatabase = () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });

  const BookModel = initBookModel(sequelize);
  const UserModel = initUserModel(sequelize);

  return { sequelize, BookModel, UserModel };
};

// Sync test database
export const syncTestDatabase = async (sequelize: Sequelize) => {
  await sequelize.sync({ force: true });
};

// Close test database
export const closeTestDatabase = async (sequelize: Sequelize) => {
  await sequelize.close();
};

// Create test book
export const createTestBook = async (BookModel: any, data?: Partial<any>) => {
  return await BookModel.create({
    title: data?.title || 'Test Book',
    author: data?.author || 'Test Author',
    year: data?.year || 2024,
  });
};

// Create test user
export const createTestUser = async (UserModel: any, data?: Partial<any>) => {
  return await UserModel.create({
    name: data?.name || 'Test User',
    email: data?.email || 'test@example.com',
  });
};

// Call GraphQL resolver (handles both function and object with resolve method)
export const callResolver = (
  resolver: any,
  parent = {},
  args = {},
  context = {},
  info = {}
) => {
  if (typeof resolver === 'function') {
    return resolver(parent, args, context, info);
  }
  if (resolver && typeof resolver.resolve === 'function') {
    return resolver.resolve(parent, args, context, info);
  }
  throw new Error(
    'Resolver is not a function or does not have a resolve method'
  );
};
