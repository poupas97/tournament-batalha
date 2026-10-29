import { getToken } from "next-auth/jwt";
import { RouteContext } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";
import { parsePositiveInteger } from "@/lib/sanitize";
import prisma from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";

export async function requireToken(request: Request) {
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const userId = parsePositiveInteger(token?.id);
  if (!token || !userId) return null;

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true },
  });

  return user ? { ...token, role: user.role } : null;
}

export async function requireAdminToken(request: Request) {
  const token = await requireToken(request);
  return token?.role === UserRole.ADMIN ? token : null;
}

export async function getParamId(context: RouteContext) {
  const params = await context.params;
  return parsePositiveInteger(params.id) ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function noFound(entity: string) {
  return NextResponse.json({ error: `Not found - ${entity}` }, { status: 404 });
}

export function invalidParam(entity: string, key?: string) {
  return NextResponse.json(
    { error: key ? "Invalid" : `Invalid - ${entity}`, key },
    { status: 400 },
  );
}

export function conflict(entity: string, key?: string) {
  return NextResponse.json(
    { error: key ? "Conflict" : `Conflict - ${entity}`, key },
    { status: 409 },
  );
}

export function getResponse<T>(entity: T) {
  return NextResponse.json(entity);
}

export function createdResponse<T>(entity: T) {
  return NextResponse.json(entity, { status: 201 });
}

export function updatedResponse<T>(entity: T) {
  return NextResponse.json(entity, { status: 200 });
}

export function deletedResponse() {
  return NextResponse.json({ success: true }, { status: 202 });
}

export function getSearchParam(request: NextRequest, key: string) {
  return request.nextUrl.searchParams.get(key);
}

export function shouldHideDeletedItems(request: NextRequest) {
  return getSearchParam(request, "noDeleted") === "true";
}
