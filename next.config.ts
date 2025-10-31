import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "TU_REF.supabase.co" },
    ],
  },
};
export default nextConfig;

