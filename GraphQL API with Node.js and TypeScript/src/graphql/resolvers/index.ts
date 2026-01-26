import { bookQueries, bookMutations, Book } from './book.resolvers';
import { userQueries, userMutations, User } from './user.resolvers';
import { authorQueries, authorMutations, Author } from './author.resolvers';

export const resolvers = {
  Query: {
    ...bookQueries,
    ...userQueries,
    ...authorQueries,
  },
  Mutation: {
    ...bookMutations,
    ...userMutations,
    ...authorMutations,
  },
  Book,
  User,
  Author,
};
