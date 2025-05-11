import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // Handle Node.js built-in modules
    if (!isServer) {
      // Alias and polyfill Node built-ins for the browser
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer'),
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        path: require.resolve('path-browserify'),
        net: false,
        tls: false,
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util/'),
        crypto: require.resolve('crypto-browserify'),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }

    // Handle externals
    config.externals = [...(config.externals || []), 'pino-pretty', 'lokijs', 'encoding'];

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: true,
  // Force same rendering in all environments
  reactStrictMode: true,
};

export default nextConfig;
