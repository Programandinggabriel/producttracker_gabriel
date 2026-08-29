import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  allowedDevOrigins: ['192.168.1.3'],
  images: {
    remotePatterns: [
      new URL('https://i.ebayimg.com/images/**'),
      new URL('https://cdn.dummyjson.com/product-images/**')
    ],
  }
}