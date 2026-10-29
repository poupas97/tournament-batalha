import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import {
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireAdminToken,
  unauthorized,
} from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const auditLogId = await getParamId(context);
  if (!auditLogId) {
    return invalidParam("AuditLog");
  }

  const auditLog = await prisma.auditLog.findUnique({
    where: { id: auditLogId },
    include: {
      actor: { select: { id: true, name: true, email: true } },
    },
  });

  if (!auditLog) {
    return noFound("AuditLog");
  }

  return getResponse(auditLog);
}
