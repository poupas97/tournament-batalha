import { AuditAction, PrismaClient } from "@/generated/prisma";
import { InputJsonValue } from "@/generated/prisma/runtime/client";
import { JWT } from "next-auth/jwt";
import { parsePositiveInteger } from "@/lib/sanitize";

type AuditEntity =
  | "Competition"
  | "Match"
  | "MatchEvent"
  | "Player"
  | "Staff"
  | "Team"
  | "User"
  | (string & {});

type AuditActionValue = (typeof AuditAction)[keyof typeof AuditAction];

type CreateAuditLogParams = {
  token: JWT;
  action: AuditActionValue;
  entity: AuditEntity;
  entityId?: number | string | null;
  before?: unknown;
  after?: unknown;
};

const SENSITIVE_KEYS = new Set([
  "actual",
  "confirm",
  "password",
  "passwordHash",
]);

function toNullableNumber(value: number | string | null | undefined) {
  return parsePositiveInteger(value) ?? null;
}

function sanitizeAuditValue(value: unknown): InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  const serialized = JSON.stringify(value, (key, nestedValue) => {
    if (SENSITIVE_KEYS.has(key)) {
      return "[REDACTED]";
    }

    return nestedValue;
  });

  if (serialized === undefined) {
    return undefined;
  }

  return JSON.parse(serialized) as InputJsonValue;
}

function getAuditActorId(token: unknown) {
  if (!token || typeof token !== "object") {
    return null;
  }

  return toNullableNumber((token as { id?: number | string | null }).id);
}

export async function createAuditLog(
  params: CreateAuditLogParams,
  client: Pick<PrismaClient, "auditLog">,
) {
  const metadata = {
    before: sanitizeAuditValue(params.before) ?? null,
    after: sanitizeAuditValue(params.after) ?? null,
  } as InputJsonValue;

  return await client.auditLog.create({
    data: {
      actorId: getAuditActorId(params.token),
      action: params.action,
      entity: params.entity,
      entityId: toNullableNumber(params.entityId),
      metadata,
    },
  });
}
