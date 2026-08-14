import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { loadConfig } from '../config';
import * as schema from './schema';

type Db = PostgresJsDatabase<typeof schema>;

declare global {
  // eslint-disable-next-line no-var -- required by TS for global augmentation
  var __torabarabimDb: Db | undefined;
}

const createDb = (): Db => {
  const { databaseUrl } = loadConfig(process.env);
  return drizzle(postgres(databaseUrl), { schema });
};

// Guards against a second connection pool if this module is re-evaluated
// in the same process (a hot reload).
export const db: Db =
  process.env.NODE_ENV === 'production' ? createDb() : (globalThis.__torabarabimDb ??= createDb());

export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
