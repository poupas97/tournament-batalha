import prisma from "@/lib/prisma";
import {
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
} from "@/constants/validation";
import { PASSWORD_HASH_ROUNDS } from "@/constants/auth";
import { sanitizeText } from "@/lib/sanitize";
import bcrypt from "bcryptjs";
import {
  createdResponse,
  getResponse,
  invalidParam,
  unauthorized,
} from "@/lib/api";
import { requireCurrentAdminToken } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const token = await requireCurrentAdminToken(request);
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
  const token = await requireCurrentAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name);
  const email = sanitizeText(body?.email);
  const password = await bcrypt.hash(body?.password, PASSWORD_HASH_ROUNDS);

  if (!name || name.length > MAX_NAME_LENGTH) {
    return invalidParam("Name");
  }

  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return invalidParam("Email");
  }

  const user = await prisma.user.create({
    data: { name, email, password },
  });

  return createdResponse(user);
}
