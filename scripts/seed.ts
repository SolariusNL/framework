import { PrismaClient } from "@prisma/client";
import { FLAGS } from "../src/stores/useFastFlags";
import { hashPass } from "../src/util/hash/password";
import logger from "../src/util/logger";

const prisma = new PrismaClient();

const stages = [
  {
    name: "create-admin-account",
    description: "Create admin account with username Framework",
    run: true,
    execute: async () => {
      const u = await prisma.user.findFirst({
        where: {
          username: "Framework",
        },
      });
      if (u) return;
      else
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

async function seedDatabase() {
  logger().debug("Seeding database...");
  try {
    for (const stage of stages) {
      if (stage.run) {
        logger().info(`Running action ${stage.name}...`);
        await stage.execute().then(() => {
          // if lkast one, exit after
          if (stage.name === stages[stages.length - 1].name) {
            logger().info("Complete with all tasks");
            process.exit(0);
          }
        })
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
