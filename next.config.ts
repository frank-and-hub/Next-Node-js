import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  env: {
    API_URL: `${process.env.BASE_URL}:${process.env.PORT}/api/`,
  },
  devServer: {
    allowedDevOrigins: [`*`], // Allow these origins
  },
};

export default nextConfig;
