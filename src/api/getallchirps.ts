import { NextFunction, Request, Response } from "express";
import { db } from "../db/index.js";
import { chirps } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function getAllChirps(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate and extract authorId query parameter
    let authorId = "";
    const authorIdQuery = req.query.authorId;
    if (typeof authorIdQuery === "string") {
      authorId = authorIdQuery;
    }

    // Validate and extract sort query parameter
    let sortOrder: "asc" | "desc" = "asc"; // Default to ascending
    const sortQuery = req.query.sort;
    if (
      typeof sortQuery === "string" &&
      (sortQuery === "asc" || sortQuery === "desc")
    ) {
      sortOrder = sortQuery;
    }

    // Fetch chirps with optional filtering
    const allChirps = authorId
      ? await db.select().from(chirps).where(eq(chirps.userId, authorId))
      : await db.select().from(chirps);

    // Sort in-memory
    const sortedChirps = allChirps.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    const formatted = sortedChirps.map((chirp) => ({
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
