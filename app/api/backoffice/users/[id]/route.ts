import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminToken } from "@/lib/token";
import { sanitizeText } from "@/lib/sanitize";
import { RouteContext } from "@/types/api";
import { getParamId, unauthorized } from "@/lib/api";

export async function GET(request: Request, context: RouteContext) {
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const user = await getParamId(context);
  if (!user) {
    return NextResponse.json(
      { error: "Utilizador inválido." },
      { status: 400 },
    );
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
    return NextResponse.json(
      { error: "Utilizador não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json(player);
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const userId = await getParamId(context);
  if (!userId) {
    return NextResponse.json(
      { error: "Utilizador inválido." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body.name);
  const email = sanitizeText(body.email);

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  if (!email || email.length > 100) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
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

  return NextResponse.json(updatedUser);
}

export async function DELETE(request: Request, context: RouteContext) {
  const token = await requireAdminToken(request);
  if (!token) {
    return unauthorized();
  }

  const userId = await getParamId(context);
  if (!userId) {
    return NextResponse.json(
      { error: "Utilizador inválido." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Utilizador não encontrado." },
      { status: 404 },
    );
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

  return NextResponse.json({ success: true });
}
