import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // Stub out native .node binaries in all builds
    config.module.rules.unshift({
      test: /\.node$/,
      type: 'javascript/auto',
      use: { loader: 'null-loader' },
    });

    // In client builds, alias the native/binary libraries to false to exclude them entirely
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@anush008/tokenizers': false,
        '@anush008/tokenizers-darwin-universal': false,
        'fastembed': false,
        'onnxruntime-node': false,
      };
      // Disable Node.js built-ins
      config.resolve.fallback = {
        fs: false,
        child_process: false,
        path: false,
        net: false,
        tls: false,
        buffer: require.resolve('buffer/'),
        ...(config.resolve.fallback || {}),
      };
      // Ignore async_hooks
      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /^node:async_hooks$/ }),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }

    // Preserve common externals so they are not bundled
    config.externals = [...(config.externals || []), 'pino-pretty', 'lokijs', 'encoding'];

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Ensure proper CSS loading
    const cssRules = config.module.rules.find(
      (rule: any) => typeof rule === 'object' && rule.test instanceof RegExp && rule.test.test('test.css')
    );
    
    if (cssRules && typeof cssRules === 'object' && Array.isArray(cssRules.oneOf)) {
      cssRules.oneOf.forEach((rule: any) => {
        if (Array.isArray(rule.use)) {
          rule.use.forEach((loader: any) => {
            if (typeof loader === 'object' && loader.loader && loader.loader.includes('css-loader')) {
              loader.options = {
                ...loader.options,
                importLoaders: 1,
                modules: {
                  auto: true,
                },
              };
            }
          });
        }
      });
    }

    return config;
  },
};

export default nextConfig;