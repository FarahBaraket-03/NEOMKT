import { makeExecutableSchema } from '@graphql-tools/schema';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scalarTypeDefs = loadFilesSync(path.join(__dirname, 'scalars.graphql'));
const enumTypeDefs = loadFilesSync(path.join(__dirname, 'types', 'enums.graphql'));
const objectTypeDefs = loadFilesSync(path.join(__dirname, 'types', '*.graphql'));

export const typeDefs = mergeTypeDefs([
  scalarTypeDefs,
  enumTypeDefs,
  objectTypeDefs,
]);

type ExecutableSchemaResolvers =
  Parameters<typeof makeExecutableSchema>[0]['resolvers'];

export const createSchema = (resolvers: ExecutableSchemaResolvers) =>
  makeExecutableSchema({
    typeDefs,
    resolvers,
  });
