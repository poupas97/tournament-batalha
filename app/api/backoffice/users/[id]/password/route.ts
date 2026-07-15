import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { RouteContext } from "@/types/api";
import { getParamId, requireAdminToken, unauthorized } from "@/lib/api";

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
  const actual = body.actual;
  const password = body.password;
  const confirm = body.confirm;

  if (!actual || !password || !confirm || password !== confirm) {
    return NextResponse.json({ error: "Password inválida." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Utilizador não encontrado." },
      { status: 404 },
    );
  }

  const valid = await bcrypt.compare(actual, user.password);

  if (!valid) {
    return NextResponse.json(
      { error: "Password atual incorreta." },
      { status: 400 },
    );
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

  return NextResponse.json(updatedUser);
}
