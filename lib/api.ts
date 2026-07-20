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
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function noFound(entity: string) {
  return NextResponse.json({ error: `Not found - ${entity}` }, { status: 404 });
}

export function invalidParam(entity: string) {
  return NextResponse.json({ error: `Invalid - ${entity}` }, { status: 400 });
}

export function getResponse<T>(entity: T) {
  return NextResponse.json(entity);
}

export function createdResponse<T>(entity: T) {
  return NextResponse.json(entity, { status: 201 });
}

export function updatedResponse<T>(entity: T) {
  return NextResponse.json(entity, { status: 204 });
}

export function deletedResponse() {
  return NextResponse.json({ success: true }, { status: 202 });
}
