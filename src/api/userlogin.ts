import { Response, Request } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { checkPasswordhash } from "./auth.js";

export async function userLogin(req: Request, res: Response) {
  const { password, email } = req.body;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const validPassword = await checkPasswordhash(
      password,
      user.hashedPassword
    );
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const { id, createdAt, updatedAt, email: userEmail } = user;
    res.status(200).json({
      id,
      createdAt,
      updatedAt,
      email: userEmail,
    });
  } catch (err) {
    console.log(err);
  }
}
