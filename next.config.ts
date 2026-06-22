import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permit HMR + dev client bundles to be loaded from tenant hostnames
  // (e.g. `*.lvh.me`, custom dev subdomains) during local development.
  // Without this, Next.js blocks the cross-origin dev resources and the
  // client never hydrates — making every interactive button appear dead.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.lvh.me",
    "*.localtest.me",
    "*.localhost",
  ],
};

export default nextConfig;
