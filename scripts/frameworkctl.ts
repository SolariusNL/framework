import logger from "../src/util/logger";
import inquirer from "inquirer";
import { spawn } from "child_process";
import { PrismaClient } from "@prisma/client";

logger().info("frameworkctl - control your self-hosted framework instance");

async function main() {
  const actions = await inquirer.prompt({
    name: "action",
    type: "list",
    message: "Choose an action",
    choices: ["🔌 Start Framework", "🖥 Seed Database", "📈 Get Statistics"],
  });

  switch (actions.action) {
    case "🔌 Start Framework":
      startFramework();
      break;
    case "🖥 Seed Database":
      seedDatabase();
      break;
    case "📈 Get Statistics":
      getStatistics();
      break;
    default:
      logger().info("Unknown action");
      main();
      break;
  }
}

async function startFramework() {
  const portQuestion = await inquirer.prompt({
    name: "port",
    type: "input",
    message: "Choose a port",
    default: 3000,
  });

  logger().info(`Starting Framework on port ${portQuestion.port}`);

  const build = spawn("yarn", ["run", "build"], {
    cwd: ".",
    stdio: "inherit",
  });

  build.on("close", (code: number) => {
    if (code !== 0) {
      logger().error(`Build failed with code ${code}`);
      return;
    }

    logger().info("Build succeeded; starting app");

    const start = spawn("next", ["start", "-p", portQuestion.port], {
      cwd: ".",
      stdio: "inherit",
    });

    start.on("close", (code: number) => {
      if (code !== 0) {
        logger().error(`Start failed with code ${code}`);
        return;
      }

      logger().info("App started successfully");
    });
  });
}

async function seedDatabase() {
  logger().info("Seeding database");

  const seed = spawn("yarn", ["run", "seed"], {
    cwd: ".",
    stdio: "inherit",
  });

  seed.on("close", (code: number) => {
    if (code !== 0) {
      logger().error(
        `Seed failed with code ${code}. Make sure you have a .env file with a DATABASE_URL pointing to a Postgresql database.`
      );
      return;
    }

    logger().info("Seed succeeded.");
  });
}

async function getStatistics() {
  const prisma = new PrismaClient();
  logger().info("Getting statistics");

  const users = await prisma.user.count();
  const games = await prisma.game.count();
  const bannedUsers = await prisma.user.count({
    where: {
      banned: true,
    },
  });
  const ticketsInCirculation = await prisma.user.aggregate({
    _sum: {
      tickets: true,
    },
  });

  logger().info(`Users: ${users}`);
  logger().info(`Games: ${games}`);
  logger().info(`Banned Users: ${bannedUsers}`);
  logger().info(`Tickets in circulation: ${ticketsInCirculation._sum.tickets}`);

  prisma.$disconnect();
}

main();
