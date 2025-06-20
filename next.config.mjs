/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC and use Babel instead for WebContainer compatibility
  swcMinify: false,
  compiler: {
    // Disable SWC compiler
    removeConsole: false,
  },
  // Force Babel usage
  experimental: {
    forceSwcTransforms: false,
  },
};

export default nextConfig;