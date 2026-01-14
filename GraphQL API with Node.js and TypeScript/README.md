# GraphQL API with Node.js, MySQL, Sequelize, and TypeScript

A GraphQL API built with Node.js, Apollo Server, MySQL, Sequelize ORM, and TypeScript with auto-generated types.

## Tech Stack

- Node.js
- TypeScript
- Apollo Server (GraphQL)
- Sequelize ORM
- MySQL
- GraphQL Code Generator
- dotenv

## Project Structure

```
your-project/
├── src/
│   ├── server.ts              # Main entry point
│   ├── types/
│   │   └── index.ts          # Custom types (if needed)
│   ├── models/
│   │   ├── index.ts          # Sequelize configuration
│   │   ├── Book.ts           # Book model
│   │   └── User.ts           # User model
│   ├── graphql/
│   │   ├── schema.ts         # GraphQL schema definitions
│   │   └── resolvers/
│   │       ├── index.ts      # Combines all resolvers
│   │       ├── bookResolvers.ts  # Book queries & mutations
│   │       └── userResolvers.ts  # User queries & mutations
│   └── generated/
│       └── graphql.ts        # Auto-generated types (do not edit)
├── dist/                     # Compiled JavaScript
├── .env                      # Environment variables
├── .gitignore
├── codegen.yml               # GraphQL Code Generator config
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm

## Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Create MySQL database

```sql
CREATE DATABASE graphql_db;
```

### 3. Configure .env file

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=graphql_db
PORT=4000
```

### 4. Generate TypeScript types

```bash
npm run generate
```

This generates TypeScript types from your GraphQL schema into `src/generated/graphql.ts`.

### 5. Build the project

```bash
npm run build
```

### 6. Start the server

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

You should see:

```
✅ Database connected successfully
✅ Database synchronized successfully
✅ Sample books inserted
✅ Sample users inserted
🚀 GraphQL Server ready at: http://localhost:4000/
```

## Available Scripts

```bash
npm run generate    # Generate TypeScript types from GraphQL schema
npm run build       # Generate types + compile TypeScript
npm start           # Run production server
npm run dev         # Run development server with auto-restart
npm run watch       # Watch TypeScript compilation
```

## Usage

Open your browser and go to `http://localhost:4000` to access Apollo Studio Explorer.

## API Examples

### Queries

**Get all books:**

```graphql
query {
  books {
    id
    title
    author
    year
    created_at
    updated_at
  }
}
```

**Get a specific book:**

```graphql
query {
  book(id: "1") {
    id
    title
    author
    year
  }
}
```

**Search books:**

```graphql
query {
  searchBooks(title: "gatsby") {
    id
    title
    author
  }
}
```

**Get all users:**

```graphql
query {
  users {
    id
    name
    email
  }
}
```

### Mutations

**Add a book:**

```graphql
mutation {
  addBook(title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937) {
    id
    title
    author
  }
}
```

**Update a book:**

```graphql
mutation {
  updateBook(id: "1", year: 1950) {
    id
    title
    year
  }
}
```

**Delete a book:**

```graphql
mutation {
  deleteBook(id: "3")
}
```

**Add a user:**

```graphql
mutation {
  addUser(name: "Charlie Brown", email: "charlie@example.com") {
    id
    name
    email
  }
}
```

**Update a user:**

```graphql
mutation {
  updateUser(id: "1", name: "Alice Smith") {
    id
    name
    email
  }
}
```

**Delete a user:**

```graphql
mutation {
  deleteUser(id: "2")
}
```

## Models

### Book

- `id` - Integer, Primary Key
- `title` - String (required)
- `author` - String (required)
- `year` - Integer (required)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### User

- `id` - Integer, Primary Key
- `name` - String (required)
- `email` - String (required, unique)
- `created_at` - Timestamp
- `updated_at` - Timestamp

## GraphQL Code Generator

This project uses GraphQL Code Generator to automatically generate TypeScript types from your GraphQL schema.

### How it works:

1. **Edit schema** in `src/graphql/schema.ts`
2. **Run generator**: `npm run generate`
3. **Types are created** in `src/generated/graphql.ts`
4. **Use typed resolvers** with full IntelliSense

### Benefits:

- ✅ Automatic type generation from GraphQL schema
- ✅ Type-safe resolvers
- ✅ Full IDE autocomplete
- ✅ Catch errors at compile time
- ✅ Single source of truth (GraphQL schema)

### Adding New Types:

1. Update `src/graphql/schema.ts`
2. Run `npm run generate`
3. Create resolver functions with auto-generated types
4. Types automatically match your schema!

## Development

**Generate types:**

```bash
npm run generate
```

**Run in development mode:**

```bash
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Watch TypeScript compilation:**

```bash
npm run watch
```

## Type Safety

All resolvers are fully typed using auto-generated types:

```typescript
import { QueryResolvers, MutationResolvers } from "../../generated/graphql";

export const bookQueries: QueryResolvers = {
  books: async () => {
    // Return type is automatically inferred!
    return await BookModel.findAll();
  },
};
```

## Adding New Features

### Adding a New Model:

1. **Create model**: `src/models/Author.ts`
2. **Update schema**: Add to `src/graphql/schema.ts`
3. **Generate types**: `npm run generate`
4. **Create resolvers**: `src/graphql/resolvers/authorResolvers.ts`
5. **Combine resolvers**: Update `src/graphql/resolvers/index.ts`

TypeScript will guide you with full type checking!

## License

MIT
