import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { chirps } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";

export async function deleteChirpHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getBearerToken(req);
    const userID = validateJWT(token, config.api.jwtSecret);
    const { chirpID } = req.params;

    if (!chirpID) {
      res.status(400).json({ error: "Chirp ID is required" });
      return;
    }

    const existingChirps = await db
      .select()
      .from(chirps)
      .where(eq(chirps.id, chirpID))
      .limit(1);

    if (existingChirps.length === 0) {
      res.status(404).json({ error: "Chirp not found" });
      return;
    }

    const chirp = existingChirps[0];

    if (chirp.userId !== userID) {
      res.status(403).json({
        error: "You are not authorized to delete this chirp",
      });
      return;
    }

    await db.delete(chirps).where(eq(chirps.id, chirpID));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
