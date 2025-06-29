import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // allow all
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
