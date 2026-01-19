# GraphQL API with Node.js and TypeScript

![CI](https://github.com/ganbold-adilbish/My-Code-Examples/workflows/GraphQL%20API%20with%20Node.js%20and%20TypeScript%20CI/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?logo=sequelize&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A fully-typed GraphQL API built with Node.js, Apollo Server, MySQL, Sequelize ORM, and TypeScript with auto-generated types.

## Features

- ✅ **Fully Type-Safe** - Auto-generated types from GraphQL schema
- ✅ **Hot Reload** - Development mode with auto-restart
- ✅ **Database ORM** - Sequelize with MySQL
- ✅ **GraphQL Playground** - Built-in Apollo Studio Explorer
- ✅ **Sample Data** - Pre-populated books and users
- ✅ **Environment Config** - dotenv for configuration
- ✅ **Code Quality** - ESLint and Prettier configured

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Usage](#usage)
- [API Examples](#api-examples)
- [Models](#models)
- [GraphQL Code Generator](#graphql-code-generator)
- [Development](#development)
- [Adding New Features](#adding-new-features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ganbold-adilbish/My-Code-Examples.git
cd "My-Code-Examples/GraphQL API with Node.js and TypeScript"

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# Create database
mysql -u root -p -e "CREATE DATABASE graphql_db;"

# Start development server (generates types automatically)
npm run dev
```

Visit http://localhost:4000 to explore the API!

## Tech Stack

- Node.js
- TypeScript
- Apollo Server (GraphQL)
- Sequelize ORM
- MySQL
- GraphQL Code Generator
- dotenv
- ESLint & Prettier (Flat Config)

## Project Structure

```
your-project/
├── src/
│   ├── server.ts              # Application entry point
│   ├── types/
│   │   └── index.ts          # Custom type definitions
│   ├── models/
│   │   ├── index.ts          # Database configuration
│   │   ├── Book.ts           # Book model definition
│   │   └── User.ts           # User model definition
│   ├── graphql/
│   │   ├── schema.ts         # GraphQL schema definitions
│   │   └── resolvers/
│   │       ├── index.ts      # Resolver aggregation
│   │       ├── bookResolvers.ts  # Book queries & mutations
│   │       └── userResolvers.ts  # User queries & mutations
│   └── generated/
│       └── graphql.ts        # Auto-generated types (do not edit)
├── .vscode/                  # VS Code settings
├── .env.example              # Environment variables template
├── .gitignore
├── .nvmrc                    # Node version specification
├── eslint.config.mts         # ESLint configuration (flat config)
├── .prettierrc               # Prettier configuration
├── .prettierignore           # Prettier ignore patterns
├── codegen.yml               # GraphQL Code Generator configuration
├── jest.config.ts            # Jest testing configuration
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript compiler configuration
└── README.md                 # Project documentation
```

## Prerequisites

- Node.js (v20 or higher) - [Download](https://nodejs.org/)
- MySQL (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- npm (comes with Node.js)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ganbold-adilbish/My-Code-Examples.git
cd "My-Code-Examples/GraphQL API with Node.js and TypeScript"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=graphql_db
PORT=4000
```

**⚠️ Important:** Never commit your `.env` file to Git. It's already in `.gitignore`.

### 4. Create MySQL database

```bash
mysql -u root -p -e "CREATE DATABASE graphql_db;"
```

Or using MySQL Workbench or any MySQL client.

### 5. Start development server

```bash
npm run dev
```

The server will:

- Generate TypeScript types from GraphQL schema
- Connect to MySQL database
- Sync database tables automatically
- Insert sample data
- Start the development server with hot reload

You should see:

```
✅ Database connected successfully
✅ Database synchronized successfully
✅ Sample books inserted
✅ Sample users inserted
🚀 GraphQL Server ready at: http://localhost:4000/
```

Visit `http://localhost:4000` to explore the API with Apollo Studio Explorer!

## Available Scripts

| Command                 | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `npm run generate`      | Generate TypeScript types from GraphQL schema     |
| `npm run build`         | Generate types + compile TypeScript to JavaScript |
| `npm start`             | Run production server from compiled code          |
| `npm run dev`           | Run development server with hot reload            |
| `npm run watch`         | Watch TypeScript compilation in real-time         |
| `npm test`              | Run Jest tests                                    |
| `npm run test:watch`    | Run Jest tests in watch mode                      |
| `npm run test:coverage` | Run tests with coverage report                    |
| `npm run format`        | Format code with Prettier                         |
| `npm run format:check`  | Check if code is formatted correctly              |
| `npm run lint`          | Run ESLint to check code quality                  |
| `npm run lint:fix`      | Run ESLint and auto-fix issues                    |
| `npm run check`         | Run both lint and format checks                   |

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

### Working with GraphQL Schema

When you modify the GraphQL schema in `src/graphql/schema.ts`:

1. Restart the dev server: `Ctrl+C` then `npm run dev`
2. Or manually regenerate types: `npm run generate`

The dev server will automatically pick up the new types and restart.

### Before Committing

Run the check script to ensure code quality:

```bash
npm run check
```

This runs both ESLint and Prettier checks.

### Running Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Type Safety

All resolvers are fully typed using auto-generated types:

```typescript
import { QueryResolvers, MutationResolvers } from '../../generated/graphql';

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

## Troubleshooting

### Database Connection Issues

If you see "Access denied for user":

- Check your MySQL credentials in `.env`
- Ensure MySQL is running: `mysql.server status` (macOS) or `sudo service mysql status` (Linux)
- Verify the database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Port Already in Use

If port 4000 is taken:

- Change `PORT` in your `.env` file
- Or kill the process using port 4000: `lsof -ti:4000 | xargs kill`

### Type Generation Errors

If `npm run generate` fails:

```bash
# Clear generated files and try again
rm -rf src/generated
npm run generate
```

### Module Not Found

If you get module import errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ESLint/Prettier Issues

If linting or formatting fails:

```bash
# Auto-fix ESLint issues
npm run lint -- --fix

# Format all files
npm run format
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Editor Setup

This project includes VS Code settings for:

- Format on save
- ESLint auto-fix on save

**Recommended VS Code extensions:**

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

## License

MIT
