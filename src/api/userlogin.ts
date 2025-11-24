import { Response, Request } from "express";
import { db } from "../db/index.js";
import { refreshTokens, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "./auth.js";
import { config } from "../config.js";

export async function userLogin(req: Request, res: Response) {
  const { password, email, expiresInSeconds } = req.body;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const validPassword = await checkPasswordHash(
      password,
      user.hashedPassword
    );
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    const token = makeJWT(user.id, 3600, config.api.jwtSecret);

    const refreshToken = makeRefreshToken();

    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      revokedAt: null,
    });

    return res.status(200).json({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      isChirpyRed: user.isChirpyRed, // Add this
      token,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
