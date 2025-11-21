import type { Request, Response } from "express";
import { config } from "../config.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export async function handlerReset(_: Request, res: Response) {
  const platform = process.env.PLATFORM;
  if (platform !== "dev") {
    return res.status(403).json({ error: "Forbidden" });
  }

  await db.delete(users).execute();
  config.api.fileServerHits = 0;
  res.write("All users deleted and hits reset to 0");
  res.end();
}
