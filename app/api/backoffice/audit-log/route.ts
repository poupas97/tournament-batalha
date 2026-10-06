import prisma from "@/lib/prisma";
import { getResponse, unauthorized } from "@/lib/api";
import { requireCurrentAdminToken } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const token = await requireCurrentAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { actor: true },
  });

  return getResponse(auditLogs);
}
