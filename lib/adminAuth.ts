import { UserRole } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { requireToken } from "@/lib/api";

export async function requireCurrentAdminToken(request: Request) {
  const token = await requireToken(request);
  const userId = Number(token?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === UserRole.ADMIN;
}
