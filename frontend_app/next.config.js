const nextConfig = {
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
        ...(config.resolve.fallback || {}),
      };
      // Ignore async_hooks
      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^node:async_hooks$/ }));
    }

    // Preserve common externals so they are not bundled
    config.externals = [...(config.externals || []), 'pino-pretty', 'lokijs', 'encoding'];

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig;