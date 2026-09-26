import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveExtensions: [".mjs", ".mts", ".ts", ".tsx", ".js", ".jsx", ".json"],
  },
};

export default nextConfig;
