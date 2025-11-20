process.loadEnvFile();

type APIConfig = {
  fileserverHits: number;
  dbURL: string;
};

if (!process.env.DB_URL) {
  throw new Error("DB_URL environment variable is required");
}

export const config: APIConfig = {
  fileserverHits: 0,
  dbURL: process.env.DB_URL!,
};
