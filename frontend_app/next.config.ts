import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle externals
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
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

    // Prevent client-side bundling errors
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;