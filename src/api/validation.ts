import type { NextFunction, Request, Response } from "express";
import { nextTick } from "process";

export function validateHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.set("Content-Type", "application/json");
    const { body } = req.body;
    const profane = ["kerfuffle", "sharbert", "fornax"];

    if (!req.body || req.body.body === undefined) {
      return res.status(400).json({
        error: "Chirp body is required",
      });
    }

    if (body.length > 140) {
      throw new Error("Chirp is too long");
    }

    const words = body.split(" ");

    const cleanWords = words.map((word: string) => {
      const lowerWord = word.toLowerCase();

      if (profane.includes(lowerWord)) {
        return "****";
      }
      return word;
    });

    const cleanedBody = cleanWords.join(" ");

    return res.status(200).json({
      cleanedBody: cleanedBody,
    });
  } catch (err) {
    next(err);
  }
}
