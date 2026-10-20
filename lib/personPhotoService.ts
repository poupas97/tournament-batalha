import "server-only";
import { randomUUID } from "node:crypto";
import {
  deletePersonPhoto as deleteStoredPhoto,
  storePersonPhoto,
} from "@/lib/objectStorage";

export type PersonPhotoType = "player" | "staff";

export async function uploadPersonPhoto(
  type: PersonPhotoType,
  personId: number,
  bytesBase64: string,
  onKeyCreated?: (key: string) => void,
) {
  const key = `${type}/${personId}/${randomUUID()}`;
  onKeyCreated?.(key);
  const url = await storePersonPhoto(key, bytesBase64);
  return { key, url };
}

export function deletePersonPhoto(key: string) {
  return deleteStoredPhoto(key);
}
