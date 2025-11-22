import argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import {
  BadRequestError,
  UserNotAuthenticatedError,
} from "../api/errorhandler.js";

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch (err) {
    throw new BadRequestError(`Failed to hash password: ${err}`);
  }
}

export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}

const TOKEN_ISSUER = "chirpy";

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string
): string {
  const iat = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    iss: TOKEN_ISSUER,
    sub: userID,
    iat,
    exp: iat + expiresIn,
  };
  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const payload = jwt.verify(tokenString, secret) as Payload;
    if (payload.iss !== TOKEN_ISSUER) {
      throw new UserNotAuthenticatedError("Invalid token issuer");
    }
    if (!payload.sub) {
      throw new UserNotAuthenticatedError("Token subject (user id) missing");
    }
    return payload.sub;
  } catch {
    throw new UserNotAuthenticatedError("Invalid or expired token");
  }
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new BadRequestError("Malformed authorization header");
  }
  return extractBearerToken(authHeader);
}

export function extractBearerToken(authHeader: string): string {
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new BadRequestError("Malformed authorization header");
  }
  return parts[1].trim();
}
