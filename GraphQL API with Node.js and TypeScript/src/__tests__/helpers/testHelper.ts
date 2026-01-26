import { Sequelize } from 'sequelize';
import { initBookModel, BookModel } from '../../models/Book';
import { initUserModel, UserModel } from '../../models/User';
import { initAuthorModel, AuthorModel } from '../../models/Author';

type BookModelType = typeof BookModel;
type UserModelType = typeof UserModel;
type AuthorModelType = typeof AuthorModel;

// Test database configuration
export const createTestDatabase = () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });

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

  return {
    sequelize,
    BookModel,
    UserModel,
    AuthorModel,
  };
};

// Sync test database
export const syncTestDatabase = async (sequelize: Sequelize) => {
  await sequelize.sync({ force: true });
};

// Close test database
export const closeTestDatabase = async (sequelize: Sequelize) => {
  await sequelize.close();
};

// Create test user
export const createTestUser = async (
  UserModel: UserModelType,
  data?: Partial<{ name: string; email: string }>
) => {
  return await UserModel.create({
    name: data?.name || 'Test User',
    email: data?.email || 'test@example.com',
  });
};

// Create test author
export const createTestAuthor = async (
  AuthorModel: AuthorModelType,
  UserModel: UserModelType,
  data?: Partial<{
    user_id?: number;
    user_name?: string;
    user_email?: string;
    bio?: string;
    website?: string;
  }>
) => {
  let userId: number;

  // If user_id is provided, use existing user
  if (data?.user_id) {
    userId = data.user_id;
  } else {
    // Otherwise, create new user
    const user = await UserModel.create({
      name: data?.user_name || 'Test Author',
      email: data?.user_email || 'author@example.com',
    });
    userId = user.id;
  }

  // Create new author profile
  return await AuthorModel.create({
    user_id: userId,
    bio: data?.bio || 'Test Author Bio',
    website: data?.website,
  });
};

// Create test book
export const createTestBook = async (
  BookModel: BookModelType,
  AuthorModel: AuthorModelType,
  UserModel: UserModelType,
  data?: Partial<{ author_id: number; title: string; year: number }>
) => {
  let authorId: number;

  // If author_id is provided, use existing author
  if (data?.author_id) {
    authorId = data.author_id;
  } else {
    // Otherwise, create new author
    const author = await createTestAuthor(AuthorModel, UserModel);
    authorId = author.id;
  }

  // Create new book
  return await BookModel.create({
    author_id: authorId,
    title: data?.title || 'Test Book',
    year: data?.year || 2026,
  });
};

// Call GraphQL resolver (handles both function and object with resolve method)
export const callResolver = (
  resolver: unknown,
  parent = {},
  args = {},
  context = {},
  info = {}
) => {
  if (typeof resolver === 'function') {
    return resolver(parent, args, context, info);
  }
  if (
    resolver &&
    typeof resolver === 'object' &&
    'resolve' in resolver &&
    typeof resolver.resolve === 'function'
  ) {
    return resolver.resolve(parent, args, context, info);
  }
  throw new Error(
    'Resolver is not a function or does not have a resolve method'
  );
};
