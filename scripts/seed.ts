import { PrismaClient } from "@prisma/client";
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
              hashPass(
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
