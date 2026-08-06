import { NextRequest, NextResponse } from "next/server";
import { requireToken } from "./lib/api";
import { UserRole } from "./generated/prisma";

const PUBLIC_PATHS = ["/backoffice/login"];
const ADMIN_PATHS = ["/backoffice/users"];

function matchesPath(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function redirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await requireToken(request);

  if (matchesPath(pathname, PUBLIC_PATHS)) {
    return token ? redirect(request, "/backoffice") : NextResponse.next();
  }

  if (!token) {
    return redirect(request, "/backoffice/login");
  }

  if (matchesPath(pathname, ADMIN_PATHS) && token.role !== UserRole.ADMIN) {
    return redirect(request, "/backoffice");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
