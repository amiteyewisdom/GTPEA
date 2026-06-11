import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/:path+",
        destination: "/:path+",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@mui/icons-material", "@mui/material", "lucide-react"],
  },
};

export default nextConfig;
