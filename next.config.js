const { AppConfigUnionType, PrismaClient } = require("@prisma/client");
const figlet = require("figlet");
const gradient = require("gradient-string");

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

  return withBundleAnalyzer(
    withMDX({
      ...nextConfig,
      pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    })
  );
};
