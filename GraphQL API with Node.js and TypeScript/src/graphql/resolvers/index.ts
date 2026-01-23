import { bookQueries, bookMutations, Book } from './book.resolvers';
import { userQueries, userMutations, User } from './user.resolvers';

export const resolvers = {
  Query: {
    ...bookQueries,
    ...userQueries,
  },
  Mutation: {
    ...bookMutations,
    ...userMutations,
  },
  Book,
  User,
};
