import "server-only";
import { createHash, createHmac } from "node:crypto";
import { getPhotoMimeType, MAX_PHOTO_BYTES } from "@/lib/photo";

export function isObjectStorageConfigured() {
  return Boolean(
    process.env.AWS_ENDPOINT_URL_S3 &&
    process.env.STORAGE_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION,
  );
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function encodePath(value: string) {
  return value.split("/").map(encodeURIComponent).join("/");
}

export async function storePersonPhoto(
  key: string,
  bytesBase64: string,
): Promise<string> {
  const body = Buffer.from(bytesBase64, "base64");
  if (!body.length || body.length > MAX_PHOTO_BYTES) {
    throw new Error("Photo must be smaller than 5 MB");
  }
  const contentType = getPhotoMimeType(body);
  if (!contentType)
    throw new Error("Only JPEG, PNG, and WebP photos are supported");

  const { url } = await sendObjectStorageRequest("PUT", key, body, contentType);
  // Configure this Neon bucket as public_read so the returned URL can be used
  // by the frontoffice without exposing storage credentials.
  return `${url.origin}${url.pathname}`;
}

export async function deletePersonPhoto(key: string) {
  await sendObjectStorageRequest("DELETE", key);
}

async function sendObjectStorageRequest(
  method: "PUT" | "DELETE",
  key: string,
  body = Buffer.alloc(0),
  contentType?: string,
) {
  const endpointValue = process.env.STORAGE_ENDPOINT_URL_S3;
  const accessKey = process.env.STORAGE_ACCESS_KEY_ID;
  const secretKey = process.env.STORAGE_SECRET_ACCESS_KEY;
  const region = process.env.STORAGE_REGION;
  const bucket = process.env.STORAGE_BUCKET;

  if (!endpointValue || !bucket || !accessKey || !secretKey || !region) {
    console.log("Object Storage is not configured");
    throw new Error("Object Storage is not configured");
  }

  const endpoint = new URL(endpointValue);
  const objectPath = `${endpoint.pathname.replace(/\/$/, "")}/${encodePath(bucket)}/${encodePath(key)}`;
  const url = new URL(objectPath, endpoint.origin);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const payloadHash = createHash("sha256").update(body).digest("hex");
  const headersToSign = [
    ...(contentType ? [`content-type:${contentType}`] : []),
    `host:${url.host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ];
  const canonicalHeaders = `${headersToSign.join("\n")}\n`;
  const signedHeaders = headersToSign
    .map((header) => header.split(":")[0])
    .join(";");
  const canonicalRequest = [
    method,
    url.pathname,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const scope = `${date}/${region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");
  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${secretKey}`, date), region), "s3"),
    "aws4_request",
  );
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers: Record<string, string> = {
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    authorization,
  };
  if (contentType) headers["content-type"] = contentType;
  const response = await fetch(url, {
    method,
    headers,
    ...(method === "PUT" ? { body } : {}),
  });
  if (method === "DELETE" && response.status === 404) return { url };
  if (!response.ok) {
    throw new Error(`Object storage ${method} failed (${response.status})`);
  }
  return { url };
}
