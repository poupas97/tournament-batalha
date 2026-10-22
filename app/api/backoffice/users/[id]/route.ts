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
      createdAt: true,
    },
  });

  if (!user) {
    return noFound("User");
  }

  return getResponse(user);
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
  const name = sanitizeName(body?.name);
  const email = normalizeEmail(body?.email, MAX_EMAIL_LENGTH);
  const role = sanitizeEnum(body?.role, UserRole);

  if (!name) {
    return invalidParam("Name");
  }

  if (!email) {
    return invalidParam("Email");
  }

  if (!role) {
    return invalidParam("Role");
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
          createdAt: true,
        },
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return conflict("Email");
    }

    throw error;
  }

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

        if (adminCount <= MINIMUM_ADMIN_COUNT) {
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
