export { auth as middleware } from '@vizo/auth'

// import { NextRequest } from 'next/server'

// const publicUrls = ['/auth/sign-in', '/auth/error']
// const privateUrls = ['/']

// export async function middleware(request: NextRequest) {
//   const session = await auth()

//   if (!session && privateUrls.includes(request.nextUrl.pathname)) {
//     return Response.redirect(new URL('/auth/sign-in', request.url))
//   }

//   if (session && publicUrls.includes(request.nextUrl.pathname)) {
//     return Response.redirect(new URL('/', request.url))
//   }
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// }
