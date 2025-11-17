import { Request, Response, NextFunction } from "express";
import { configobj } from "../config.js";

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode < 200 || statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });

  next();
}

export function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.on("finish", () => {
    configobj.fileserverHits++;
  });
  next();
}

export function handlerMetrics(_req: Request, res: Response) {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${configobj.fileserverHits} times!</p>
  </body>
</html>`);
}

export function handlerReset(_req: Request, res: Response) {
  configobj.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits reset to 0");
}
