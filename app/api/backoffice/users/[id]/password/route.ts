import prisma from "@/lib/prisma";
import { PASSWORD_HASH_ROUNDS } from "@/constants/auth";
import { isValidPassword } from "@/lib/authValidation";
import bcrypt from "bcryptjs";
import { RouteContext } from "@/types/api";
import {
  getParamId,
  invalidParam,
  noFound,
  requireAdminToken,
  unauthorized,
  updatedResponse,
} from "@/lib/api";

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
  const actual = body?.actual;
  const password = body?.password;
  const confirm = body?.confirm;

  if (typeof actual !== "string") {
    return invalidParam("CurrentPassword", "actual");
  }

  if (!isValidPassword(password)) {
    return invalidParam("Password", "password");
  }

  if (typeof confirm !== "string" || password !== confirm) {
    return invalidParam("PasswordConfirmation", "confirm");
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
  });

  if (!existing) {
    return noFound("User");
  }

  const valid = await bcrypt.compare(actual, existing.password);

  if (!valid) {
    return invalidParam("CurrentPassword", "actual");
  }

  const hashedPassword = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return updatedResponse(updatedUser);
}
