export const typeDefs = `#graphql
  type Book {
    id: ID!
    title: String!
    author: String!
    year: Int!
    created_at: String
    updated_at: String
  }

  type User {
    id: ID!
    name: String!
    email: String!
    created_at: String
    updated_at: String
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    users: [User!]!
    user(id: ID!): User
    searchBooks(title: String!): [Book!]!
  }

  type Mutation {
    addBook(title: String!, author: String!, year: Int!): Book!
    updateBook(id: ID!, title: String, author: String, year: Int): Book
    deleteBook(id: ID!): Boolean!
    addUser(name: String!, email: String!): User!
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): Boolean!
  }
`;