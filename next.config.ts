import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ระบุตำแหน่งการอ้างอิงรูปภาพจาก Network/Internets
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uhyqjuyhbyoayhpdxxcp.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
