/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  compiler: {
    // Disable SWC
  },
  experimental: {
    forceSwcTransforms: false,
  },
};

export default nextConfig;