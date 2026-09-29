import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Creator avatars come from Clerk.
    remotePatterns: [{ protocol: "https", hostname: "img.clerk.com" }],
  },
};

export default nextConfig;
