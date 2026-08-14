import { defineConfig } from 'drizzle-kit';

// The environment is loaded by the `db:generate`/`db:migrate` scripts via
// `node --env-file`, not here; see server/package.json.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set; copy '.env.example' to '.env' at the repo root first.");
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: { url: databaseUrl },
});
