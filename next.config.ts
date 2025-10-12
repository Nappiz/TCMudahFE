// next.config.ts
import type { NextConfig } from "next";

const BE_DEST =
  process.env.NODE_ENV === "production"
    ? "https://tcmudahbe.vercel.app"
    : "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BE_DEST}/:path*`,
      },
    ];
  },
};

export default nextConfig;
