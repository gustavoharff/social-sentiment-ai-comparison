import { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session && request.nextUrl.pathname === '/') {
    const response = Response.redirect(new URL("/auth/sign-in", request.url));

    return response;
  }
}
