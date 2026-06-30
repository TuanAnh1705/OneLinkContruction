import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 80, 85, 90, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.olco.com.au",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
