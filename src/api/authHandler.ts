import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getBearerToken, validateJWT, hashPassword } from "./auth.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errorhandler.js";
import { config } from "../config.js";

interface UpdateUserBody {
  email: string;
  password: string;
}

export async function authHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getBearerToken(req);
    const userID = validateJWT(token, config.api.jwtSecret);
    const { email, password } = req.body as UpdateUserBody;
    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }
    const hashedPassword = await hashPassword(password);

    const updatedUsers = await db
      .update(users)
      .set({
        email: email,
        hashedPassword: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userID))
      .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (updatedUsers.length === 0) {
      throw new BadRequestError("User not found");
    }

    res.status(200).json(updatedUsers[0]);
  } catch (error) {
    next(error);
  }
}
