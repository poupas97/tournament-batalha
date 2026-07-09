export function sanitizeText(value: string) {
  return value.trim().replace(/["';<>]/g, "");
}
