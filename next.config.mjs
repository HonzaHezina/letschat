/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely disable SWC
  swcMinify: false,
  
  // Force use of Babel
  experimental: {
    forceSwcTransforms: false,
  },
  
  // Webpack configuration to ensure Babel is used
  webpack: (config, { dev, isServer }) => {
    // Force Babel for all JS/TS files
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });
    
    return config;
  },
};

export default nextConfig;