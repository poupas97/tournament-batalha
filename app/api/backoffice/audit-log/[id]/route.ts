import prisma from "@/lib/prisma";
import { RouteContext } from "@/types/api";
import {
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  unauthorized,
} from "@/lib/api";
import { requireCurrentAdminToken } from "@/lib/adminAuth";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireCurrentAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const auditLogId = await getParamId(context);
  if (!auditLogId) {
    return invalidParam("AuditLog");
  }

  const auditLog = await prisma.auditLog.findUnique({
    where: { id: auditLogId },
    include: { actor: true },
  });

  if (!auditLog) {
    return noFound("AuditLog");
  }

  return getResponse(auditLog);
}
