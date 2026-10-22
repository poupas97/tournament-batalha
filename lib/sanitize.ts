import { MAX_NAME_LENGTH } from "@/constants/validation";

export function sanitizeText(value: string) {
  return value.trim().replace(/["';<>]/g, "");
}

export function sanitizeName(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const name = sanitizeText(value);

  return name.length > 0 && name.length <= MAX_NAME_LENGTH ? name : undefined;
}

export function normalizeEmail(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return undefined;
  }

  const email = value.trim().toLowerCase();

  if (email.length > maxLength || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return undefined;
  }

  return email;
}

export function sanitizeColor(value: unknown) {
  return typeof value === "string" && /^#[\da-fA-F]{6}$/.test(value)
    ? value.toLowerCase()
    : undefined;
}

export function sanitizeNumber(value: string) {
  return parsePositiveInteger(value);
}

export function parsePositiveInteger(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") {
    return undefined;
  }

  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

export function sanitizeEnum<T extends Record<string, string>>(
  value: string,
  enumType: T,
): T[keyof T] | undefined {
  const sanitized = sanitizeText(value);

  return Object.values(enumType).includes(sanitized as T[keyof T])
    ? (sanitized as T[keyof T])
    : undefined;
}

export function sanitizeBoolean(value: string | boolean | undefined | null) {
  if (
    value === undefined ||
    value === null ||
    value === "undefined" ||
    value === "null"
  ) {
    return undefined;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return undefined;
}

export function sanitizeDate(value: string) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) ? date : undefined;
}
