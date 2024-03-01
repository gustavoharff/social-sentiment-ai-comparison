/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    remotePatterns: [
      { hostname: 'platform-lookaside.fbsbx.com' }
    ],
  },
};

export default nextConfig;
