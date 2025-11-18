import express, { application } from "express";

import { handlerReadiness } from "./api/readiness.js";
import {
  handlerMetrics,
  handlerReset,
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { validateHandler } from "./api/validation.js";

const app = express();
const PORT = 8080;
app.use(express.json());

app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", validateHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
