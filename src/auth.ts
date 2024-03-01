import NextAuth, { NextAuthConfig } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";

export const config = {
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  secret: process.env.AUTH_SECRET!,
  providers: [
    FacebookProvider({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
      authorization: {
        params: {
          auth_type: "rerequest",
          scope: "public_profile",
        },
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
