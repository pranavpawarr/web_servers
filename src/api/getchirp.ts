import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { chirps } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function getChirpById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { chirpID } = req.params;

    const [chirp] = await db
      .select()
      .from(chirps)
      .where(eq(chirps.id, chirpID));

    if (!chirp) {
      return res.status(404).json({ error: "Chirp not found" });
    }

    return res.status(200).json({
      id: chirp.id,
      createdAt: chirp.createdAt.toISOString(),
      updatedAt: chirp.updatedAt.toISOString(),
      body: chirp.body,
      userId: chirp.userId,
    });
  } catch (err) {
    next(err);
  }
}
