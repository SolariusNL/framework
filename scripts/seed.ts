import { FastFlagUnionType, Prisma, PrismaClient } from "@prisma/client";
import { hashPass } from "../src/util/hash/password";
import logger from "../src/util/logger";

const prisma = new PrismaClient();

const stages = [
  {
    name: "create-admin-account",
    description: "Create admin account with username Framework",
    run: true,
    execute: async () => {
      await prisma.user
        .create({
          data: {
            email: "admin@invent.soodam.rocks",
            password: String(
              await hashPass(
                Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15)
              )
            ),
            role: "ADMIN",
            username: "Framework",
            premium: true,
            avatarUri: "",
            avatar: {
              create: {},
            },
          },
        })
        .then(() => {
          logger().info("Admin user created");
        });
    },
  },
  {
    name: "seed-fast-flags",
    description:
      "Seed fast flags (feature flags to influence the app at runtime)",
    run: true,
    execute: async () => {
      const FLAGS: Array<Prisma.FastFlagCreateInput> = [
        {
          name: "disabled-settings",
          value: "[]",
          valueType: FastFlagUnionType.ARRAY,
          description:
            "Disable certain settings pages in circumstances where it may be necessary, to lock down certain features",
        },
        {
          name: "disabled-registration",
          value: "false",
          valueType: FastFlagUnionType.BOOLEAN,
          description: "Disable registration for the app",
        },
        {
          name: "maintenance",
          value: "false",
          valueType: FastFlagUnionType.BOOLEAN,
          description: "Enable maintenance mode",
        },
        {
          name: "disabled-chat",
          value: "false",
          valueType: FastFlagUnionType.BOOLEAN,
          description: "Disable chat for the app",
        },
        {
          name: "banner",
          value: JSON.stringify({
            enabled: false,
            message: "Welcome to Framework!",
          }),
          valueType: FastFlagUnionType.OBJECT,
          description: "Enable a system-wide banner",
        },
      ];

      for (const flag of FLAGS) {
        await prisma.fastFlag
          .findFirst({
            where: {
              name: flag.name,
            },
          })
          .then(async (f) => {
            if (!f) {
              await prisma.fastFlag.create({
                data: flag,
              });

              logger().info(`Created fast flag ${flag.name}`);
            }
          });
      }

      logger().info("Fast flags seeded");
    },
  },
];

async function verifyDatabase() {
  logger().debug("Verifying database...");
  try {
    await prisma.user
      .findFirst({
        where: {
          username: "Framework",
        },
      })
      .then((u) => {
        if (u) {
          logger().warn("Admin user already exists");
          stages.find((s) => s.name === "create-admin-account")!.run = false;
        }
      });
  } catch (e) {
    logger().error(
      "Could not verify database. Make sure your Postgres server is running on the configured port, host, and password in the .env file"
    );
    process.exit(1);
  }
}

async function seedDatabase() {
  verifyDatabase();

  logger().debug("Seeding database...");
  try {
    for (const stage of stages) {
      if (stage.run) {
        logger().info(`Running action ${stage.name}...`);
        await stage.execute();
      }
    }
  } catch (error) {
    logger().error(String(error) || "Unknown error seeding database");
  }
}

seedDatabase()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    logger().error(String(error) || "Unknown error seeding database");
    await prisma.$disconnect();
    process.exit(1);
  });
