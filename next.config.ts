/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig = {
  images: {
    domains: SUPABASE_URL ? [new URL(SUPABASE_URL).hostname] : [],
    // remotePatterns 쓰실 거면 domains 대신 이걸로 (둘 중 하나만)
    // remotePatterns: SUPABASE_URL ? [{
    //   protocol: new URL(SUPABASE_URL).protocol.replace(":", ""),
    //   hostname: new URL(SUPABASE_URL).hostname,
    //   pathname: "/storage/v1/object/public/**",
    // }] : [],
  },

  async rewrites() {
    return [
      // /flutter 또는 /flutter/ 또는 /flutter/anything → 항상 index.html 서빙
      { source: "/flutter", destination: "/flutter/index.html" },
      { source: "/flutter/:path*", destination: "/flutter/index.html" },
    ];
  },
};

module.exports = nextConfig;
