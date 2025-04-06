import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  env: {
    API_URL: `${process.env.BASE_URL}:${process.env.PORT}/api/`,
  },
  // devServer: {
  //   allowedDevOrigins: [`*`], // Allow these origins
  // },
  webpack(config) {
    config.resolve.fallback = {
      tls: false,
      fs: false,
      net: false,
      path: false,
      child_process: false,
    };

    return config;
  },
};

export default nextConfig;
