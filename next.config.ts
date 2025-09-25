/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig = {
  images: {
    // 방법 1: 간단히 domains 사용
    domains: SUPABASE_URL ? [new URL(SUPABASE_URL).hostname] : [],

    // 방법 2: remotePatterns를 쓰고 싶다면 아래처럼(둘 중 하나만 쓰세요)
    // remotePatterns: SUPABASE_URL ? [
    //   {
    //     protocol: new URL(SUPABASE_URL).protocol.replace(":", ""),
    //     hostname: new URL(SUPABASE_URL).hostname,
    //     pathname: "/storage/v1/object/public/**",
    //   },
    // ] : [],
  },

  // Flutter 정적 서빙 리라이트(유지)
  async rewrites() {
    return [
      { source: "/app", destination: "/app/index.html" },
      { source: "/app/:path*", destination: "/app/index.html" },
    ];
  },
};

module.exports = nextConfig;
