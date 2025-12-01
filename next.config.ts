import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/opportunities',
        destination: '/jobs',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
