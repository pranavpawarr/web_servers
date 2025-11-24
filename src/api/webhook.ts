import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getAPIKey } from "./auth.js";
import { config } from "../config.js";

interface WebhookEvent {
  event: string;
  data: {
    userId: string;
  };
}

export async function polkaWebhookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate API key
    const apiKey = getAPIKey(req);

    if (apiKey !== config.api.polkaKey) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { event, data } = req.body as WebhookEvent;

    // If event is not user.upgraded, respond with 204 immediately
    if (event !== "user.upgraded") {
      res.status(204).send();
      return;
    }

    // Extract userId from the webhook data
    const { userId } = data;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Update the user to mark them as Chirpy Red
    const updatedUsers = await db
      .update(users)
      .set({
        isChirpyRed: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    // If no user was updated, they don't exist
    if (updatedUsers.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Success - return 204 with no body
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
