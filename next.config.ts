import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "10.10.7.65",
        port: "5010",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "humayon5002.binarybards.online",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5010",
        pathname: "/**",
      },
      // Add your specific uploads pattern
      {
        protocol: "http",
        hostname: "10.10.7.65",
        port: "5010",
        pathname: "/uploads/**",  // This specifically allows uploads folder
      },
    ],
  },
};

export default nextConfig;