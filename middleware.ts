import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/backoffice/login", "/backoffice/login/"];
const secret = process.env.NEXTAUTH_SECRET || "dev-secret";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/backoffice")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request as any, secret });

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
