import { Response, Request } from "express";
import { db } from "../db/index.js";
import { users, refreshTokens } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { makeJWT } from "./auth.js";
import { config } from "../config.js";

export async function refreshTokenHandler(req: Request, res: Response) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Parse the token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Look up the refresh token in the database
    const [refreshTokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1);

    // Check if token exists
    if (!refreshTokenRecord) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Check if token is expired
    const now = new Date();
    if (refreshTokenRecord.expiresAt < now) {
      return res.status(401).json({ error: "Refresh token expired" });
    }

    // Check if token is revoked
    if (refreshTokenRecord.revokedAt !== null) {
      return res.status(401).json({ error: "Refresh token revoked" });
    }

    // Generate new access token (expires in 1 hour = 3600 seconds)
    const accessToken = makeJWT(
      refreshTokenRecord.userId,
      3600,
      config.api.jwtSecret
    );

    return res.status(200).json({
      token: accessToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
