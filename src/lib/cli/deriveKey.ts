import { pbkdf2Sync, randomBytes } from "crypto";

export function deriveKey(secret: string, salt?: string) {
  let _salt = salt;
  if (!_salt) {
    const buf = randomBytes(64);
    _salt = buf.toString("base64");
  }
  const key = pbkdf2Sync(secret, _salt, 100000, 64, "sha512");
  return {
    salt: _salt,
    derivedKey: key.toString("base64"),
  };
}
