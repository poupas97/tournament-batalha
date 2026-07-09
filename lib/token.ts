import { getToken } from "next-auth/jwt";

export async function requireToken(request: Request) {
  return getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
}
