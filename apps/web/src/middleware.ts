import { NextRequest } from "next/server";
import { auth } from "@vizo/auth"

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session && request.nextUrl.pathname === '/') {
    const response = Response.redirect(new URL("/auth/sign-in", request.url));

    return response;
  }
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};