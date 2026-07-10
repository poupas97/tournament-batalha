export function sanitizeText(value: string) {
  return value.trim().replace(/["';<>]/g, "");
}

export function sanitizeNumber(value: string) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}
