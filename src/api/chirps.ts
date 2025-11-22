import { Request, Response } from "express";
import { BadRequestError } from "./errorhandler.js";
import { db } from "../db/index.js";
import { chirps } from "../db/schema.js";
import { getBearerToken, validateJWT } from "../api/auth.js";
import { config } from "../config.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.jwtSecret);

    const { body } = req.body;

    const profane = ["kerfuffle", "sharbert", "fornax"];

    if (!body) {
      return res.status(400).json({ error: "Chirp body is required" });
    }

    if (body.length > 140) {
      throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const cleanWords = body
      .split(" ")
      .map((word: string) =>
        profane.includes(word.toLowerCase()) ? "****" : word
      );
    const cleanedBody = cleanWords.join(" ");

    const [newChirp] = await db
      .insert(chirps)
      .values({
        body: cleanedBody,
        userId,
      })
      .returning();

    if (!newChirp) {
      return res.status(500).json({ error: "Failed to create a chirp" });
    }

    return res.status(201).json({
      id: newChirp.id,
      createdAt: newChirp.createdAt.toISOString(),
      updatedAt: newChirp.updatedAt.toISOString(),
      body: newChirp.body,
      userId: newChirp.userId,
    });
  } catch (err: any) {
    if (
      err.message === "Malformed authorization header" ||
      err.message === "Invalid or expired token" ||
      err.message === "Invalid token issuer" ||
      err.message === "Token subject (user id) missing"
    ) {
      return res.status(401).json({ error: "Unauthorized: " + err.message });
    }
    if (err instanceof BadRequestError) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
