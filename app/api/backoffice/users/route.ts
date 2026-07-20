import prisma from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import bcrypt from "bcryptjs";
import {
  createdResponse,
  getResponse,
  invalidParam,
  requireToken,
  unauthorized,
} from "@/lib/api";

export async function GET(request: Request) {
  const token = await requireToken(request);
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
      createdAt: true,
    },
  });

  return getResponse(users);
}

export async function POST(request: Request) {
  const token = await requireToken(request);
  if (!token || token.role !== "ADMIN") {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body.name);
  const email = sanitizeText(body.email);
  const password = await bcrypt.hash(body.password, 12);

  if (!name || name.length > 100) {
    return invalidParam("Name");
  }

  if (!email || email.length > 100) {
    return invalidParam("Email");
  }

  const user = await prisma.user.create({
    data: { name, email, password },
  });

  return createdResponse(user);
}
