import { UserRole } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { requireToken } from "@/lib/api";
import { parsePositiveInteger } from "@/lib/sanitize";

export async function requireCurrentAdminToken(request: Request) {
  const token = await requireToken(request);
  const userId = parsePositiveInteger(token?.id);

  if (!userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === UserRole.ADMIN;
}
