import { MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH } from "@/constants/auth";

export function isValidPassword(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Array.from(value).length >= MIN_PASSWORD_LENGTH &&
    Buffer.byteLength(value, "utf8") <= MAX_PASSWORD_BYTES
  );
}
