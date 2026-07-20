import prisma from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import {
  deletedResponse,
  getParamId,
  getResponse,
  invalidParam,
  noFound,
  requireAdminToken,
  unauthorized,
  updatedResponse,
} from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireAdminToken(request);
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
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const userId = await getParamId(context);
  if (!userId) {
    return invalidParam("User");
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body.name);
  const email = sanitizeText(body.email);

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  if (!email || email.length > 100) {
    return invalidParam("Email");
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) {
    return noFound("User");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { name, email },
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

export async function DELETE(request: Request, context: RouteContext) {
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
    select: { id: true },
  });

  if (!user) {
    return noFound("User");
  }

  await prisma.user.delete({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return deletedResponse();
}
