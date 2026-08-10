import type { NextConfig } from "next";
import path from "node:path";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion", "clsx", "@supabase/supabase-js"],
  },
  // Turbopack resolve for monorepo-style `@shared/*` (files live in ./shared).
  turbopack: {
    resolveAlias: {
      "@shared": path.join(__dirname, "shared"),
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
