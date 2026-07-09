import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

function sanitizeText(value: string) {
  return value.trim().replace(/["'`;<>]/g, "");
}

function sanitizeColor(value: unknown) {
  if (typeof value !== "string") {
    return "#2563eb";
  }

  const color = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#2563eb";
}

function getMembersFromBody(body: any, key: "players" | "staff") {
  if (!Array.isArray(body?.[key])) {
    return [];
  }

  return body[key]
    .map((member: any) =>
      typeof member?.name === "string" ? sanitizeText(member.name) : "",
    )
    .filter((name: string) => name.length > 0 && name.length <= 100)
    .map((name: string) => ({ name }));
}

export async function GET(request: Request) {
  const token = await getToken({ req: request as any, secret });
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { players: true, staff: true },
      },
    },
  });

  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const token = await getToken({ req: request as any, secret });
  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? sanitizeText(body.name) : "";
  const color = sanitizeColor(body?.color);
  const players = getMembersFromBody(body, "players");
  const staff = getMembersFromBody(body, "staff");

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      name,
      color,
      players: players.length > 0 ? { create: players } : undefined,
      staff: staff.length > 0 ? { create: staff } : undefined,
    },
    include: {
      players: true,
      staff: true,
    },
  });

  return NextResponse.json(team, { status: 201 });
}
