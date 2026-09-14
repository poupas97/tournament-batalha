import { Player } from "@/generated/prisma";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";

type PlayerInput = {
  name: string;
  number: number;
};

type StaffInput = {
  name: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function sanitizePlayers(value: unknown): PlayerInput[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const numbers = new Set<number>();
  const players: PlayerInput[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      return undefined;
    }

    const name = typeof item.name === "string" ? sanitizeText(item.name) : "";
    const number =
      typeof item.number === "string" ? sanitizeNumber(item.number) : undefined;

    if (
      !name ||
      name.length > 100 ||
      !number ||
      number > 99 ||
      numbers.has(number)
    ) {
      return undefined;
    }

    numbers.add(number);
    players.push({ name, number });
  }

  return players;
}

export function sanitizeStaffs(
  value: unknown,
): StaffInput[] | undefined | null {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const staffs: StaffInput[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }

    const name = typeof item.name === "string" ? sanitizeText(item.name) : "";

    if (!name || name.length > 100) {
      return null;
    }

    staffs.push({ name });
  }

  return staffs;
}
