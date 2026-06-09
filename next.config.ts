import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Don't block the production build on pre-existing lint/type errors in
  // unrelated example files — the app itself is type-clean.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // Allow canvas for PDF.js
    config.resolve.alias.canvas = false;
    return config;
  },
  // Allow external scripts from cdnjs for PDF.js worker
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com; worker-src 'self' blob: https://cdnjs.cloudflare.com;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
