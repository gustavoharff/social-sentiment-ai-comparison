import 'next-auth/jwt'

import { DefaultSession } from 'next-auth'

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    providerAccountId?: string
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string
    } & DefaultSession['user']
  }

  interface User {
    accessToken?: string
  }
}
