import argon2 from "argon2";

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
