import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireToken } from "./lib/api";

const PUBLIC_PATHS = ["/backoffice/login", "/backoffice/login/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/backoffice")) {
    return NextResponse.next();
  }

  const token = await requireToken(request);

  if (PUBLIC_PATHS.includes(pathname)) {
    if (token) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/backoffice";
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/backoffice/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
