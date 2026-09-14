import { Player } from "@/generated/prisma";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";

type PlayerInput = {
  name: string;
  number: string;
};

type StaffInput = {
  name: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function sanitizePlayers(
  value: PlayerInput[] | undefined,
): Partial<Player>[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const numbers = new Set<number>();
  const players: Partial<Player>[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      return undefined;
    }

    const name = sanitizeText(item.name);
    const number = sanitizeNumber(item.number);

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
