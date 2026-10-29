import prisma from "@/lib/prisma";
import { MAX_EMAIL_LENGTH } from "@/constants/validation";
import { PASSWORD_HASH_ROUNDS } from "@/constants/auth";
import { normalizeEmail, sanitizeName } from "@/lib/sanitize";
import { isValidPassword } from "@/lib/authValidation";
import { isUniqueConstraintError } from "@/lib/prismaErrors";
import bcrypt from "bcryptjs";
import {
  conflict,
  createdResponse,
  getResponse,
  invalidParam,
  requireAdminToken,
  unauthorized,
} from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      deletedAt: true,
      createdAt: true,
    },
  });

  return getResponse(users);
}

export async function POST(request: Request) {
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeName(body?.name);
  const email = normalizeEmail(body?.email, MAX_EMAIL_LENGTH);
  const rawPassword: unknown = body?.password;
  const confirm: unknown = body?.confirm;

  if (!name) {
    return invalidParam("Name", "name");
  }

  if (!email) {
    return invalidParam("Email", "email");
  }

  if (!isValidPassword(rawPassword)) {
    return invalidParam("Password", "password");
  }

  if (typeof confirm !== "string" || rawPassword !== confirm) {
    return invalidParam("PasswordConfirmation", "confirm");
  }

  const emailInUse = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (emailInUse) {
    return conflict("Email", "email");
  }

  const password = await bcrypt.hash(rawPassword, PASSWORD_HASH_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { name, email, password },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    return createdResponse(user);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return conflict("Email", "email");
    }

    throw error;
  }
}
