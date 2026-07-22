export function sanitizeText(value: string) {
  return value.trim().replace(/["';<>]/g, "");
}

export function sanitizeNumber(value: string) {
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
