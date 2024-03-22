import { env } from '@vizo/env'
import type { NextAuthConfig, Session } from 'next-auth'

import { drizzleAuthAdapter } from './drizzle-auth-adapter'
import { facebookProvider } from './facebook-provider'

export const authConfig = {
  adapter: drizzleAuthAdapter,
  providers: [facebookProvider],
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: env.AUTH_SECRET,
  callbacks: {
    jwt({ token, session, trigger }) {
      // if (user) {
      //   token.companyId = user.companyId
      // }

      function isSessionAvailable(session: unknown): session is Session {
        return !!session
      }

      if (trigger === 'update' && isSessionAvailable(session)) {
        token.name = session.user?.name
      }

      return token
    },
    session({ session, ...params }) {
      if ('token' in params && session.user) {
        session.user.id = params.token.sub!
      }

      return session
    },
  },
} satisfies NextAuthConfig
