import prisma from "@/lib/prisma";
import { getResponse, requireAdminToken, unauthorized } from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { id: true, name: true, email: true } },
    },
  });

  return getResponse(auditLogs);
}
