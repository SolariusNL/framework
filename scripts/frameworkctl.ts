import { PrismaClient } from "@prisma/client";
import { spawn, spawnSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import inquirer from "inquirer";
import yaml from "js-yaml";
import Configuration from "../src/types/Configuration";
import logger from "../src/util/logger";

logger().info("frameworkctl - control your self-hosted framework instance");

let PID: number | undefined;

function pidIsRunning(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function getPidMemory(pid: number) {
  const { stdout } = spawnSync("ps", ["-o", "rss=", "-p", pid.toString()]);
  return parseInt(stdout.toString());
}

async function main() {
  PID = await readFile(".next/FW_PID")
    .then((data) => parseInt(data.toString()))
    .catch(() => undefined);
  let running = PID && pidIsRunning(PID);

  const actions = await inquirer.prompt({
    name: "action",
    type: "list",
    message: "Choose an action",
    choices: [
      ...(!running ? ["🔌 Start Framework"] : []),
      "🖥 Seed Database",
      "📈 Get Statistics",
      "⚙ Set config value",
      ...(running ? ["🔌 Stop Framework", "💿 Framework Status"] : []),
    ],
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
    case "🔌 Stop Framework":
      if (PID) {
        process.kill(PID);
        logger().info("Stopped Framework");
      }
      break;
    case "⚙ Set config value":
      configMenu();
      break;
    case "💿 Framework Status":
      if (PID) {
        const mbUsage = getPidMemory(PID) / 1024;

        logger().info(`Framework is running with PID ${PID}`);
        logger().info(`Framework is using ${mbUsage} MB of memory`);
      }
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

  let rebuild = false;

  if (existsSync(".next")) {
    await inquirer
      .prompt({
        name: "rebuild",
        type: "confirm",
        message:
          "We found a .next folder, would you like to use the existing build or rebuild? (y=rebuild, n=use existing)",
        default: true,
      })
      .then((answer) => {
        rebuild = answer.rebuild;
      });
  }

  const build = spawn("yarn", ["run", "build"], {
    cwd: ".",
    stdio: "inherit",
  });

  if (!rebuild) {
    build.kill();
    logger().info("Using existing build");
  }

  build.on("close", async (code: number) => {
    if (code !== 0 && rebuild) {
      logger().error(`Build failed with code ${code}`);
      return;
    }

    logger().info("Build succeeded; starting app");

    if (process.platform === "linux" && portQuestion.port < 1024) {
      if (process.getuid!() !== 0) {
        logger().error(
          "You are trying to start Framework on a port below 1024. This requires elevated permissions on Linux."
        );
      }
    }

    const start = spawn("next", ["start", "-p", portQuestion.port], {
      cwd: ".",
      detached: true,
      stdio: ["ignore", "ignore", "ignore", "ipc"],
    });

    start.on("close", (code: number) => {
      if (code !== 0) {
        logger().error(`Start failed with code ${code}`);
        return;
      }
    });

    start.stdout?.pipe(
      createWriteStream(`.next/${new Date().toISOString()}.log`)
    );

    logger().info(
      "App started successfully. You can safely exit this process, Framework will continue to run in the background."
    );

    writeFile(".next/FW_PID", start.pid!.toString()).catch((err) => {
      logger().error("Failed to save PID to .next/FW_PID");
      logger().error(err);
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

async function configMenu() {
  const valuePathQuestion = await inquirer.prompt({
    name: "valuePath",
    type: "input",
    message: "Enter a value path (e.g. 'states.maintenance.enabled')",
  });

  const config = yaml.load(
    await readFile("framework.yml", { encoding: "utf-8" })
  ) as Configuration;

  const value = valuePathQuestion.valuePath
    .split(".")
    .reduce((acc: any, key: string) => {
      if (acc === undefined) {
        return undefined;
      }

      return acc[key];
    }, config);

  if (value === undefined) {
    logger().error("Invalid value path");
    return;
  }

  if (typeof value === "object") {
    logger().error(
      "Value path is an object. Please choose a value path that is a primitive value. To reference a property in a list, use the index of the list. E.g. 'states.maintenance.messages.0'"
    );
    return;
  }

  const valueType = typeof value;

  const valueQuestion = await inquirer.prompt({
    name: "value",
    type: valueType === "boolean" ? "confirm" : "input",
    message: "Enter a value",
    default: value,
  });

  valuePathQuestion.valuePath
    .split(".")
    .reduce((acc: any, key: string, index: number, arr: string[]) => {
      if (index === arr.length - 1) {
        acc[key] = valueQuestion.value as typeof value;
      }

      return acc[key];
    }, config);

  if (!existsSync("backups/config")) {
    mkdirSync("backups/config", {
      recursive: true,
    });
  }

  await writeFile(
    `backups/config/${new Date().toISOString()}.yml`,
    yaml.dump(config)
  );
  await writeFile("framework.yml", yaml.dump(config));

  logger().info(
    "Config updated. Backups can be found in the backups/config folder."
  );
}

main();
