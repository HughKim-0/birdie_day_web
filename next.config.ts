const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

module.exports = {
  images: {
    remotePatterns: SUPABASE_URL
      ? [
          {
            protocol: new URL(SUPABASE_URL).protocol.replace(":", ""),
            hostname: new URL(SUPABASE_URL).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};