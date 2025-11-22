import { Response, Request } from "express";
import { db } from "../db/index.js";
import { refreshTokens } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function revokeTokenHandler(req: Request, res: Response) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Parse the token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Revoke the token by setting revoked_at and updated_at
    await db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(refreshTokens.token, token));

    // Respond with 204 No Content (successful, no response body)
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
