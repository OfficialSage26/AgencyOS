import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // File uploads flow through a Server Action; raise the 1MB default to fit
    // our 10MB-per-file storage limit (plus multipart overhead).
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
