import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

export const typeDefs = loadSchemaSync('./src/graphql/schema/**/*.graphql', {
  loaders: [new GraphQLFileLoader()],
});
