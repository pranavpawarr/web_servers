import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT } from "../api/auth.js";
import { hashPassword, checkPasswordHash } from "./auth";

describe("JWT Tests", () => {
  const secret = "testSecret";
  const userID = "user123";
  let token: string;

  it("should create a valid JWT", () => {
    token = makeJWT(userID, 60, secret);
    expect(typeof token).toBe("string");
  });

  it("should validate a valid JWT and return the user ID", () => {
    const sub = validateJWT(token, secret);
    expect(sub).toBe(userID);
  });

  it("should reject an expired JWT", () => {
    const expiredToken = makeJWT(userID, -1, secret);
    expect(() => validateJWT(expiredToken, secret)).toThrow(
      "Invalid or expired token"
    );
  });

  it("should reject JWTs signed with the wrong secret", () => {
    const tokenWithWrongSecret = makeJWT(userID, 60, "wrongSecret");
    expect(() => validateJWT(tokenWithWrongSecret, secret)).toThrow(
      "Invalid or expired token"
    );
  });
});

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for incorrect password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });
});
