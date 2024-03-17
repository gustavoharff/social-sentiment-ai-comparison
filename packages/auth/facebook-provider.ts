import FacebookProvider from "next-auth/providers/facebook";
import { env } from '@vizo/env'

export const facebookProvider = FacebookProvider({
  clientId: env.FACEBOOK_CLIENT_ID,
  clientSecret: env.FACEBOOK_CLIENT_SECRET,
  authorization: {
    params: {
      auth_type: "rerequest",
      scope: [
        "email",
        "public_profile",
        "pages_show_list",
        "pages_read_engagement",
        'business_management'
      ].join(","),
    },
  },
  profile(profile, tokens) {
    return {
      ...profile,
      id: profile.id,
      accessToken: tokens.access_token,
      image: profile.picture?.data?.url,
    };
  },
})