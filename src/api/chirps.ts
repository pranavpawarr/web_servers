import { Request, Response } from "express";
import { BadRequestError } from "./errorhandler.js";
import { db } from "../db/index.js";
import { chirps } from "../db/schema.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  const { body, userId } = req.body;
  const profane = ["kerfuffle", "sharbert", "fornax"];
  if (!body) {
    return res.status(400).json({
      error: "Chirp body is required",
    });
  }

  if (body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  if (!userId) {
    return res.status(400).json({
      error: "User Id is required",
    });
  }

  const words = body.split(" ");
  const cleanWords = words.map((word: string) =>
    profane.includes(word.toLowerCase()) ? "****" : word
  );
  const cleanedBody = cleanWords.join(" ");

  const [newChirp] = await db
    .insert(chirps)
    .values({
      body: cleanedBody,
      userId: userId,
    })
    .returning();

  if (!newChirp) {
    return res.status(500).json({ error: "Failed to Create a Chirp" });
  }
  res.status(201).json({
    id: newChirp.id,
    createdAt: newChirp.createdAt.toISOString(),
    updatedAt: newChirp.updatedAt.toISOString(),
    body: newChirp.body,
    userId: newChirp.userId,
  });
}
