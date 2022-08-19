/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

const withMDX = require("@next/mdx")({
  // get mdx files in src/pages
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
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
