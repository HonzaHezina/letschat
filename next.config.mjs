/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minification
  swcMinify: false,
  
  // Use Babel instead of SWC
  experimental: {
    forceSwcTransforms: false,
  },
  
  // Ensure compatibility with WebContainer environment
  transpilePackages: [],
  
  webpack: (config, { dev, isServer }) => {
    // Fallback for environments where SWC doesn't work
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

export default nextConfig;