import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Lets the dev server (HMR, JS chunks) be reached from other devices on the
  // LAN — e.g. testing on a phone at http://<mac-lan-ip>:3001 — which Next.js
  // blocks by default as a cross-origin-request safety measure.
  allowedDevOrigins: ["192.168.4.129"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
