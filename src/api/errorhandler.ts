import type { NextFunction, Request, Response } from "express";

export function handleError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("Something went wrong on our end");
  res.status(500).json({
    error: "Something went wrong on our end",
  });
  next();
}
