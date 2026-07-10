import { getToken } from "next-auth/jwt";

export async function requireToken(request: Request) {
  return getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
}

export async function requireAdminToken(request: Request) {
  const token = await requireToken(request);

  return !token || token.role !== "ADMIN";
}
