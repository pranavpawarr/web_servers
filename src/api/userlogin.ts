import { Response, Request } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { checkPasswordHash, makeJWT } from "./auth.js";
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

    const expires =
      typeof expiresInSeconds === "number" &&
      expiresInSeconds > 0 &&
      expiresInSeconds <= 3600
        ? expiresInSeconds
        : 3600;

    const token = makeJWT(user.id, expires, config.api.jwtSecret);

    return res.status(200).json({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
