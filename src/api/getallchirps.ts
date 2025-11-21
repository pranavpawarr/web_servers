import { NextFunction, Request, Response } from "express";
import { db } from "../db/index.js";
import { chirps } from "../db/schema.js";
import { asc } from "drizzle-orm";

export async function getAllChirps(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const allChirps = await db
      .select()
      .from(chirps)
      .orderBy(asc(chirps.createdAt));

    const formatted = allChirps.map((chirp) => ({
      id: chirp.id,
      createdAt: chirp.createdAt.toISOString(),
      updatedAt: chirp.updatedAt.toISOString(),
      body: chirp.body,
      userId: chirp.userId,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
}
