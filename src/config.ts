import dotenv from "dotenv";
import type { MigrationConfig } from "drizzle-orm/migrator";

dotenv.config();

type Config = {
  api: APIConfig;
  db: DBConfig;
};

type APIConfig = {
  fileServerHits: number;
  port: number;
  jwtSecret: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

process.loadEnvFile();

function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    fileServerHits: 0,
    port: Number(envOrThrow("PORT")),
    jwtSecret: envOrThrow("JWT_SECRET"),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
  },
};
