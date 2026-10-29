import prisma from "@/lib/prisma";
import { AuditAction } from "@/generated/prisma";
import { createAuditLog } from "@/lib/audit";
import {
  getResponse,
  invalidParam,
  noFound,
  requireToken,
  unauthorized,
} from "@/lib/api";
import { sanitizeNumber, sanitizeText } from "@/lib/sanitize";

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token) return unauthorized();

  const body = await request.json().catch(() => null);
  const entity = sanitizeText(body?.entity);
  const id = sanitizeNumber(body?.id);

  if (!entity || !id) {
    return invalidParam("Record");
  }

  try {
    await prisma.$transaction(async (tx) => {
      let before: unknown;
      let after: unknown;

      switch (entity) {
        case "competitions":
          before = await tx.competition.findUnique({
            where: { id, deletedAt: { not: null } },
          });

          if (!before) throw new Error("NOT_FOUND");

          after = await tx.competition.update({
            where: { id, deletedAt: { not: null } },
            data: { deletedAt: null },
          });
          break;

        case "matches":
          before = await tx.match.findUnique({
            where: { id, deletedAt: { not: null } },
          });

          if (!before) throw new Error("NOT_FOUND");

          after = await tx.match.update({
            where: { id, deletedAt: { not: null } },
            data: { deletedAt: null },
          });
          break;

        case "teams":
          before = await tx.team.findUnique({
            where: { id, deletedAt: { not: null } },
          });

          if (!before) throw new Error("NOT_FOUND");

          after = await tx.team.update({
            where: { id, deletedAt: { not: null } },
            data: { deletedAt: null },
          });
          break;

        case "users":
          before = await tx.user.findUnique({
            where: { id, deletedAt: { not: null } },
          });

          if (!before) throw new Error("NOT_FOUND");

          after = await tx.user.update({
            where: { id, deletedAt: { not: null } },
            data: { deletedAt: null },
          });
          break;

        case "players":
          before = await tx.player.findUnique({
            where: { id, deletedAt: { not: null } },
          });

          if (!before) throw new Error("NOT_FOUND");

          after = await tx.player.update({
            where: { id, deletedAt: { not: null } },
            data: { deletedAt: null },
          });
          break;
      }

      await createAuditLog(
        {
          token,
          action: AuditAction.UPDATE,
          entity,
          entityId: id,
          before,
          after,
        },
        tx,
      );
    });

    return getResponse({ success: true, id, entity });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return noFound(entity);
    }
    throw error;
  }
}
