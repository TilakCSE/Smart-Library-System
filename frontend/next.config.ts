import type { NextConfig } from "next";
// @ts-expect-error
import withPWAInit from "next-pwa";


const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Don't cache aggressively in dev mode
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  allowedDevOrigins: ['172.20.10.4'],
};

export default withPWA(nextConfig);


