const { AppConfigUnionType, PrismaClient } = require("@prisma/client");
const figlet = require("figlet");
const gradient = require("gradient-string");
const { join } = require("path");
const { existsSync, mkdirSync } = require("fs");

function requireTypescript(path) {
  const fileContent = require("fs").readFileSync(path, "utf8");
  const compiled = require("@babel/core").transform(fileContent, {
    filename: path,
    presets: ["@babel/preset-env", "@babel/preset-typescript"],
  });
  const Module = module.constructor;
  const m = new Module();
  m._compile(compiled.code, path);
  return m.exports;
}

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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://solarius.me",
          },
        ],
      },
    ];
  },
  experimental: {
    scrollRestoration: true,
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

/**
 * @type {import("@prisma/client").AppConfig[]}
 */
const appConfig = [
  {
    type: AppConfigUnionType.BOOLEAN,
    key: "didSetup",
    value: "true",
    id: "did-setup",
  },
  {
    type: AppConfigUnionType.NUMBER,
    key: "setupState",
    value: "0",
    id: "setup-state",
  },
  {
    type: AppConfigUnionType.OBJECT,
    key: "setupData",
    value: JSON.stringify({
      1: {
        dbType: "",
        dbConnector: "",
        dbHost: "",
        dbPort: 5432,
        dbUser: "",
        dbPassword: "",
        dbName: "",
      },
    }),
    id: "setup-data",
  },
];

module.exports = () => {
  const gradientFiglet = gradient.pastel;
  const figletText = figlet.textSync("Framework", {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  });

  console.log(gradientFiglet(figletText));
  console.log("For a new generation of gaming and federated platforms");

  const prisma = new PrismaClient();
  prisma.$connect();

  appConfig.forEach(async (config) => {
    const appConfig = await prisma.appConfig.findUnique({
      where: {
        id: config.id,
      },
    });

    if (!appConfig) {
      await prisma.appConfig.create({
        data: config,
      });
      console.log(`Created app config ${config.key}`);
    }
  });

  const buckets = requireTypescript("./src/util/buckets.ts").default;

  buckets.forEach((bucket) => {
    const path = join(process.cwd(), "data-storage", bucket);
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
  });

  return withBundleAnalyzer(
    withMDX({
      ...nextConfig,
      pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    })
  );
};
