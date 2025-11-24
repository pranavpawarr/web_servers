import type { NextFunction, Request, Response } from "express";

interface CustomError extends Error {
  statusCode?: number;
}

export function handleError(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(err);

  const statusCode = err.statusCode || 500;
  const message = err.message;
  res.status(statusCode).json({
    error: message,
  });
}

export class BadRequestError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UserNotAuthenticatedError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;

    Object.setPrototypeOf(this, UserNotAuthenticatedError.prototype);
  }
}

export class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
