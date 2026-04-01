import { makeExecutableSchema } from '@graphql-tools/schema';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveSchemaRoot(): string {
  const candidates = [
    __dirname,
    path.join(__dirname, '..', '..', 'src', 'schema'),
    path.join(process.cwd(), 'src', 'schema'),
    path.join(process.cwd(), 'apps', 'api', 'src', 'schema'),
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'scalars.graphql'))) {
      return candidate;
    }
  }

  return __dirname;
}

const schemaRoot = resolveSchemaRoot();

const scalarTypeDefs = loadFilesSync(path.join(schemaRoot, 'scalars.graphql'));
const enumTypeDefs = loadFilesSync(path.join(schemaRoot, 'types', 'enums.graphql'));
const objectTypeDefs = loadFilesSync(path.join(schemaRoot, 'types', '*.graphql'));

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
