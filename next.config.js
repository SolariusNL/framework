/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: "js-yaml-loader",
    });
    return config;
  },
  // allow requests to *.soodam.rocks
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://soodam.rocks",
          },
        ],
      },
    ];
  },
};

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    providerImportSource: "@mdx-js/react",
  },
});

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(
  withMDX({
    ...nextConfig,
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  })
);
