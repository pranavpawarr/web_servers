import { Request, Response } from "express";
import { users } from "../db/schema.js";
import { db } from "../db/index.js";

export async function userHandler(req: Request, res: Response) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid email" });
  }

  const now = new Date();

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!newUser) {
    return res.status(500).json({ error: "Failed to Create User" });
  }

  res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  });
}
