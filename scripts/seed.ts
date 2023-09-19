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
              email: "admin@solarius.me",
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
  {
    name: "seed-sound-licenses",
    description: "Seed sound licenses",
    run: true,
    execute: async () => {
      const commonLicenseHolders = [
        {
          name: "SM Entertainment",
          location: "South Korea",
        },
        {
          name: "JYP Entertainment",
          location: "South Korea",
        },
        {
          name: "YG Entertainment",
          location: "South Korea",
        },
        {
          name: "Kakao Corporation",
          location: "South Korea",
        },
        {
          name: "Sony Music Japan",
          location: "Japan",
        },
        {
          name: "Avex Group",
          location: "Japan",
        },
        {
          name: "Universal Music Group",
          location: "United States",
        },
        {
          name: "Warner Music Group",
          location: "United States",
        },
        {
          name: "Sony Music Entertainment",
          location: "United States",
        },
      ];

      for (const holder of commonLicenseHolders) {
        await prisma.soundLicenseHolder
          .findFirst({
            where: {
              name: holder.name,
            },
          })
          .then(async (f) => {
            if (!f) {
              await prisma.soundLicenseHolder.create({
                data: holder,
              });

              logger().info(`Created sound license holder ${holder.name}`);
            }
          });
      }

      logger().info("Sound licenses seeded");
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
          if (stage.name === stages[stages.length - 1].name) {
            logger().info("Complete with all tasks");
            process.exit(0);
          }
        });
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
