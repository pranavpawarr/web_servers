import argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    return `${err}`;
  }
}

export async function checkPasswordhash(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    if (await argon2.verify(hash, password)) {
      console.log("password matched");
      return true;
    } else {
      console.log("password did not match");
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string
): string {
  const iat = Math.floor(Date.now() / 1000);

  const payload: Payload = {
    iss: "chirpy",
    sub: userID,
    iat,
    exp: iat + expiresIn,
  };

  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const payload = jwt.verify(tokenString, secret) as Payload;
    return payload.sub!;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}
