export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTO_BASE64_LENGTH = Math.ceil((MAX_PHOTO_BYTES * 4) / 3);

export const PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type PhotoMimeType = (typeof PHOTO_MIME_TYPES)[number];

export function isPhotoMimeType(value: string): value is PhotoMimeType {
  return PHOTO_MIME_TYPES.some((mimeType) => mimeType === value);
}

export function getPhotoMimeType(bytes: Uint8Array): PhotoMimeType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).every((byte, index) => byte === PNG_SIGNATURE[index])
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function getPhotoMimeTypeFromBase64(
  value: string,
): PhotoMimeType | null {
  if (value.startsWith("/9j/")) return "image/jpeg";
  if (value.startsWith("iVBORw0KGgo")) return "image/png";
  if (value.startsWith("UklGR")) return "image/webp";
  return null;
}

export function isPhotoUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 2048 &&
    /^https?:\/\//.test(value)
  );
}

export function isValidPhotoValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (isPhotoUrl(value)) return true;
  return (
    typeof value === "string" &&
    value.length <= MAX_PHOTO_BASE64_LENGTH &&
    /^[A-Za-z0-9+/]+=*$/.test(value) &&
    getPhotoMimeTypeFromBase64(value) !== null
  );
}

export function getPhotoPreviewSource(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  if (isPhotoUrl(value)) return value;

  const dataUrl =
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/.exec(value);
  if (dataUrl) {
    const [, mimeType, bytesBase64] = dataUrl;
    return getPhotoMimeTypeFromBase64(bytesBase64) === mimeType ? value : null;
  }

  const mimeType = getPhotoMimeTypeFromBase64(value);
  return mimeType ? `data:${mimeType};base64,${value}` : null;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + chunkSize),
    );
  }

  return btoa(binary);
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.subarray(start, end));
}

export async function resizeImage(file: File) {
  const image = await createImageBitmap(file);
  const maxDimension = 512;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    image.close();
    throw new Error("Não foi possível redimensionar a imagem");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Não foi possível comprimir a imagem")),
      "image/webp",
      0.82,
    );
  });
}
