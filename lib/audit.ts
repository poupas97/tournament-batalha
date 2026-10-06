import { AuditAction, PrismaClient } from "@/generated/prisma";
import { InputJsonValue } from "@/generated/prisma/runtime/client";
import { JWT } from "next-auth/jwt";

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
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
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

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function getAuditChanges(
  before: InputJsonValue | undefined,
  after: InputJsonValue | undefined,
): InputJsonValue | undefined {
  if (!isJsonRecord(before) || !isJsonRecord(after)) {
    return undefined;
  }

  const beforeRecord = before as Record<string, unknown>;
  const afterRecord = after as Record<string, unknown>;

  const changes: Record<string, { before: unknown; after: unknown }> = {};

  const keys = new Set([
    ...Object.keys(beforeRecord),
    ...Object.keys(afterRecord),
  ]);

  for (const key of keys) {
    const beforeValue = beforeRecord[key];
    const afterValue = afterRecord[key];

    if (isEqual(beforeValue, afterValue)) {
      continue;
    }

    changes[key] = {
      before: beforeValue,
      after: afterValue,
    };
  }

  if (!Object.keys(changes).length) {
    return undefined;
  }

  return {
    changedFields: Object.keys(changes),
    changes,
  } as InputJsonValue;
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
  const before = sanitizeAuditValue(params.before);
  const after = sanitizeAuditValue(params.after);
  const metadata = getAuditChanges(before, after);

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
