import prisma from "@/lib/prisma";
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
  const actual = body.actual;
  const password = body.password;
  const confirm = body.confirm;

  if (!actual || !password || !confirm || password !== confirm) {
    return invalidParam("Password");
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existing) {
    return noFound("User");
  }

  const valid = await bcrypt.compare(actual, existing.password);

  if (!valid) {
    return invalidParam("Password");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
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
