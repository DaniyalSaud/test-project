import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   experimental: {
          serverComponentsExternalPackages: ['tesseract.js'],
   }
};

export default nextConfig;
