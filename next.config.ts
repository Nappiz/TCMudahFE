import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const cleanUrl = backendUrl.replace(/\/+$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${cleanUrl}/:path*`,
      },
    ]
  },
};

export default nextConfig;