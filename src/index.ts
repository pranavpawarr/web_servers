import dotenv from "dotenv";
dotenv.config();
import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { handlerReadiness } from "./api/readiness.js";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { validateHandler } from "./api/validation.js";
import { handleError } from "./api/errorhandler.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { config } from "./config.js";
import { userHandler } from "./api/users.js";
import { handlerChirpsCreate } from "./api/chirps.js";
import { getAllChirps } from "./api/getallchirps.js";
import { getChirpById } from "./api/getchirp.js";
import { userLogin } from "./api/userlogin.js";
import { refreshTokenHandler } from "./api/refresh.js";
import { revokeTokenHandler } from "./api/revoke.js";
import { authHandler } from "./api/authHandler.js";
import { deleteChirpHandler } from "./api/deletechirp.js";
import { polkaWebhookHandler } from "./api/webhook.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(express.json());
app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.get("/api/chirps", getAllChirps);
app.get("/api/chirps/:chirpID", getChirpById);

app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", validateHandler);
app.post("/api/users", userHandler);
app.post("/api/chirps", handlerChirpsCreate);
app.post("/api/login", userLogin);
app.post("/api/refresh", refreshTokenHandler);
app.post("/api/revoke", revokeTokenHandler);
app.post("/api/polka/webhooks", polkaWebhookHandler); // ✅ With leading slash

app.put("/api/users", authHandler);
app.delete("/api/chirps/:chirpID", deleteChirpHandler);

app.use(handleError);
app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
