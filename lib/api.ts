import { getToken } from "next-auth/jwt";
import { RouteContext } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";
import { parsePositiveInteger } from "@/lib/sanitize";

export async function requireToken(request: Request) {
  return getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
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

export function invalidParam(entity: string) {
  return NextResponse.json({ error: `Invalid - ${entity}` }, { status: 400 });
}

export function conflict(entity: string) {
  return NextResponse.json({ error: `Conflict - ${entity}` }, { status: 409 });
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
