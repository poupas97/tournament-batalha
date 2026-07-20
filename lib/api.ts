import { getToken } from "next-auth/jwt";
import { RouteContext } from "@/types/api";
import { NextResponse } from "next/server";

export async function requireToken(request: Request) {
  return getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
}

export async function requireAdminToken(request: Request) {
  const token = await requireToken(request);

  return token?.role === "ADMIN";
}

export async function getParamId(context: RouteContext) {
  const params = await context.params;
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}
