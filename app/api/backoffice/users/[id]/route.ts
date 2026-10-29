import prisma from "@/lib/prisma";
import { MINIMUM_ADMIN_COUNT } from "@/constants/auth";
import { MAX_EMAIL_LENGTH } from "@/constants/validation";
import { sanitizeEnum, sanitizeName, normalizeEmail } from "@/lib/sanitize";
import { isUniqueConstraintError } from "@/lib/prismaErrors";
import { RouteContext } from "@/types/api";
import {
  conflict,
  deletedResponse,
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireAdminToken,
  unauthorized,
  updatedResponse,
} from "@/lib/api";
import { AuditAction, UserRole } from "@/generated/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const userId = await getParamId(context);
  if (!userId) {
    return invalidParam("User");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      deletedAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    return noFound("User");
  }

  return getResponse(user);
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const userId = await getParamId(context);
  if (!userId) {
    return invalidParam("User");
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeName(body?.name);
  const email = normalizeEmail(body?.email, MAX_EMAIL_LENGTH);
  const role = sanitizeEnum(body?.role, UserRole);

  if (!name) {
    return invalidParam("Name", "name");
  }

  if (!email) {
    return invalidParam("Email", "email");
  }

  if (!role) {
    return invalidParam("Role", "role");
  }

  let updatedUser: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  } | null;

  try {
    updatedUser = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: { id: true, role: true },
      });

      if (!existing) return null;

      if (existing.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
        const adminCount = await tx.user.count({
          where: { role: UserRole.ADMIN, deletedAt: null },
        });

        if (adminCount <= MINIMUM_ADMIN_COUNT) {
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
          deletedAt: true,
          createdAt: true,
        },
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return conflict("Email", "email");
    }

    throw error;
  }

  if (!updatedUser) {
    if (
      await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
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
  const token = await requireAdminToken(request);
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
        where: { id: userId, deletedAt: null },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          deletedAt: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error("NOT_FOUND");
      }

      if (user.role === UserRole.ADMIN) {
        const adminCount = await tx.user.count({
          where: { role: UserRole.ADMIN, deletedAt: null },
        });

        if (adminCount <= MINIMUM_ADMIN_COUNT) {
          throw new Error("LAST_ADMIN");
        }
      }

      const deleted = await tx.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          deletedAt: true,
          createdAt: true,
        },
      });

      await createAuditLog(
        {
          token,
          action: AuditAction.DELETE,
          entity: "User",
          entityId: userId,
          before: user,
          after: deleted,
        },
        tx,
      );
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
