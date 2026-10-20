import { PLAYER_NUMBER_MAX } from "@/constants/validation";
import { parsePositiveInteger, sanitizeName } from "@/lib/sanitize";
import { isPhotoUrl, isValidPhotoValue } from "@/lib/photo";

export { isPhotoUrl } from "@/lib/photo";

type PlayerInput = {
  id?: number;
  name: string;
  number: number;
  photo?: string | null;
};

type StaffInput = {
  id?: number;
  name: string;
  photo?: string | null;
};

function sanitizePhoto(value: unknown) {
  if (!isValidPhotoValue(value)) return undefined;
  return typeof value === "string" && value ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function sanitizePlayers(
  value: unknown,
): PlayerInput[] | undefined | null {
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

    const id = parsePositiveInteger(item.id);
    const name = sanitizeName(item.name);
    const number = parsePositiveInteger(item.number);
    const photo = sanitizePhoto(item.photo);

    if (
      !name ||
      !number ||
      number > PLAYER_NUMBER_MAX ||
      numbers.has(number) ||
      photo === undefined
    ) {
      return undefined;
    }

    numbers.add(number);
    players.push({ ...(id ? { id } : {}), name, number, photo });
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

    const name = sanitizeName(item.name);
    const photo = sanitizePhoto(item.photo);
    const id = parsePositiveInteger(item.id);

    if (!name || photo === undefined) {
      return null;
    }

    staffs.push({ ...(id ? { id } : {}), name, photo });
  }

  return staffs;
}
