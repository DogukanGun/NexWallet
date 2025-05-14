import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['node-fetch'],
  experimental: {
    esmExternals: 'loose',
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

    // Handle ES Module packages
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Add rule to transform require('node-fetch') to dynamic import
    config.module.rules.push({
      test: /\.js$/,
      include: [
        /node_modules\/@3land\/listings-sdk/,
      ],
      use: [{
        loader: 'string-replace-loader',
        options: {
          multiple: [
            {
              search: 'require\\([\'"]node-fetch[\'"]\\)',
              replace: 'import("node-fetch")',
              flags: 'g'
            }
          ]
        }
      }]
    });

    // Handle externals
    config.externals = [
      ...(config.externals || []),
      'pino-pretty',
      'lokijs',
      'encoding'
    ];

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
