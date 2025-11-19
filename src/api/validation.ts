import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "./errorhandler.js";

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
      throw new BadRequestError("Chirp is too long. Max length is 140");
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
