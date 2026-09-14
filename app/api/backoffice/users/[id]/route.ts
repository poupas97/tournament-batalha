import prisma from "@/lib/prisma";
import { sanitizeEnum, sanitizeText } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import {
  deletedResponse,
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  unauthorized,
  updatedResponse,
} from "@/lib/api";
import { UserRole } from "@/generated/prisma";
import { requireCurrentAdminToken } from "@/lib/adminAuth";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireCurrentAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const user = await getParamId(context);
  if (!user) {
    return invalidParam("User");
  }

  const player = await prisma.user.findUnique({
    where: { id: user },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!player) {
    return noFound("Player");
  }

  return getResponse(player);
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireCurrentAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const userId = await getParamId(context);
  if (!userId) {
    return invalidParam("User");
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name);
  const email = sanitizeText(body?.email);
  const role = sanitizeEnum(body?.role, UserRole);

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  if (!email || email.length > 100) {
    return invalidParam("Email");
  }

  if (!role) {
    return invalidParam("Role");
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!existing) {
      return null;
    }

    if (existing.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
      const adminCount = await tx.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        return null;
      }
    }

    return tx.user.update({
      where: { id: userId },
      data: { name, email, role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  });

  if (!updatedUser) {
    if (
      await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })
    ) {
      return invalidParam("LastAdmin");
    }
    return noFound("User");
  }

  return updatedResponse(updatedUser);
}

export async function DELETE(request: Request, context: RouteContext) {
  const token = await requireCurrentAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const userId = await getParamId(context);
  if (!userId) {
    return invalidParam("User");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });

      if (!user) {
        throw new Error("NOT_FOUND");
      }

      if (user.role === UserRole.ADMIN) {
        const adminCount = await tx.user.count({
          where: { role: UserRole.ADMIN },
        });

        if (adminCount <= 1) {
          throw new Error("LAST_ADMIN");
        }
      }

      await tx.user.delete({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return noFound("User");
    }

    if (error instanceof Error && error.message === "LAST_ADMIN") {
      return invalidParam("LastAdmin");
    }

    throw error;
  }

  return deletedResponse();
}
