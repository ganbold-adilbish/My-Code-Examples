import { bookQueries, bookMutations, Book } from "./bookResolvers";
import { userQueries, userMutations, User } from "./userResolvers";

export const resolvers = {
  Query: {
    ...bookQueries,
    ...userQueries,
  },
  Mutation: {
    ...bookMutations,
    ...userMutations,
  },
  User,
  Book,
};
