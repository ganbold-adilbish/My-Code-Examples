import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import dotenv from 'dotenv';
import { testConnection, syncDatabase, closeDatabase } from './models';
import { typeDefs, resolvers } from './graphql';

dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  try {
    await testConnection();
    await syncDatabase();

    const { url } = await startStandaloneServer(server, {
      listen: { port: Number(process.env.PORT) || 4000 },
    });

    console.log(`🚀 GraphQL Server ready at: ${url}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});
