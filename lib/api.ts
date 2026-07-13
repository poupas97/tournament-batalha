import { RouteContext } from "@/types/api";
import { NextResponse } from "next/server";

export function getParamId(context: RouteContext) {
  const id = Number(context.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}
