import { PrismaClient } from "@prisma/client";
import { spawn, spawnSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { readFile, rmdir, writeFile } from "fs/promises";
import inquirer from "inquirer";
import yaml from "js-yaml";
import open from "open";
import Configuration from "../src/types/Configuration";
import { hashPass } from "../src/util/hash/password";
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
  if (process.platform !== "linux" && process.platform !== "darwin") {
    logger().error(
      "frameworkctl can only be ran on unix systems because it uses several unix specific commands. we're sorry for the inconvenience."
    );
    process.exit(1);
  }

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
      "❌ Exit",
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
        const cpuUsage = spawnSync("ps", ["-o", "%cpu=", "-p", PID.toString()]);
        const cpuUsageFormatted = cpuUsage.stdout.toString().trim();

        logger().info(`Framework is running with PID ${PID}`);
        logger().info(`Framework is using ${mbUsage.toFixed(2)} MB of memory`);
        logger().info(`Framework is using ${cpuUsageFormatted}% of CPU`);
        if (process.platform === "linux") {
          logger().info("Process tree:");
          logger().info(
            "\n" +
              spawnSync("pstree", ["-p", PID.toString()])
                .stdout.toString()
                .replace(/(\d+)/g, "\x1b[36m$1\x1b[0m")
          );
        }
      }
      break;
    case "❌ Exit":
      process.exit(0);
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
      logger().error(
        `Build failed with code ${code}. If this is unexpected, please file an issue on the Framework GitHub repository.\n` +
          "We're sorry for the inconvenience."
      );

      if (process.platform === "darwin") {
        await macosAlert(
          "Build failed",
          "Build failed with code " +
            code +
            ". If this is unexpected, please file an issue on the Framework GitHub repository. We're sorry for the inconvenience.",
          "critical",
          ["Open GitHub", "Close"],
          "Open GitHub"
        ).then((r) => {
          if (r === "Open GitHub") {
            open("https://github.com/Tsodinq/framework/issues/new");
          }
        });
      }

      return;
    }

    logger().info("Build succeeded; starting app");

    if (process.platform === "linux" || process.platform === "darwin") {
      if (process.getuid!() !== 0 && portQuestion.port < 1024) {
        logger().error(
          "You are trying to start Framework on a port below 1024. This requires elevated permissions on Linux."
        );
      }
    }

    const start = spawn("next", ["start", "-p", portQuestion.port], {
      cwd: ".",
      detached: true,
      stdio: "pipe",
    });

    start.on("close", (code: number) => {
      if (code !== 0) {
        logger().error(`Start failed with code ${code}`);
        return;
      }
    });

    const stream = createWriteStream(`.next/${new Date().toISOString()}.log`);

    start.stdout.on("data", (data) => {
      stream.write(data);
    });

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

/**
 * command line args for features not visually represented in the menu
 */
async function cli() {
  const args = {
    "--clear-backups": [
      Boolean,
      "Clears all backups stored in the backups folder",
    ],
    "--query": [String, "Runs a query. E.g. --query database"],
    "--help": [Boolean, "Shows this help message"],
    "--set-pwd": [Boolean, "Sets the password for the admin user"],
  };

  let opts: { name: string; value: any }[] = [];

  for (let i = 0; i < process.argv.length; i++) {
    if (args[process.argv[i] as keyof typeof args]) {
      opts.push({
        name: process.argv[i],
        value:
          process.argv[i + 1] && !process.argv[i + 1].startsWith("--")
            ? process.argv[i + 1].split(",")
            : true,
      });
    }
  }

  const contains = (name: string) => {
    return opts.filter((opt) => opt.name === name).length > 0;
  };

  const get = (name: string) => {
    const value = opts.filter((opt) => opt.name === name)[0].value;
    return Array.isArray(value) && value.length === 1 ? value[0] : value;
  };

  const wasArgful = opts.length > 0;

  if (contains("--clear-backups")) {
    logger().info("Clearing backups");

    if (existsSync("backups")) {
      await rmdir("backups", { recursive: true });
    }

    mkdirSync("backups", {
      recursive: true,
    });

    logger().info("Backups cleared");
  }

  if (contains("--query")) {
    const query = get("--query");
    const queries = {
      database: getStatistics,
    };

    if (typeof query === "string") {
      if (query in queries) {
        await queries[query as keyof typeof queries]();
      } else {
        logger().error("Invalid query for --query: " + query);
      }
    }

    if (Array.isArray(query)) {
      for (const q of query) {
        if (q in queries) {
          await queries[q as keyof typeof queries]();
        } else {
          logger().error("Invalid query: " + q);
        }
      }
    }
  }

  if (contains("--help")) {
    logger().info(
      "Framework CLI Help\n\n" +
        Object.entries(args)
          .map(([key, value]) => {
            return `\t${key.padEnd(20)} ${value[1]}`;
          })
          .join("\n")
    );
  }

  if (contains("--set-pwd")) {
    const prisma = new PrismaClient();
    const admin = await prisma.user.findFirst({
      where: {
        username: "Framework",
        role: "ADMIN",
      },
    });

    const provided = get("--set-pwd");

    if (!admin) {
      logger().error("Admin user not found. Did you seed the database?");
      return;
    }

    if (provided && typeof provided === "string") {
      await prisma.user.update({
        where: {
          id: admin.id,
        },
        data: {
          password: await hashPass(String(provided)),
        },
      });
    } else {
      const password = await inquirer.prompt({
        name: "password",
        type: "password",
        message: "Enter a password",
      });

      await prisma.user.update({
        where: {
          id: admin.id,
        },
        data: {
          password: await hashPass(password.password),
        },
      });
    }

    logger().info("Password updated");
  }

  if (wasArgful) {
    logger().info("Finished");
    process.exit(0);
  }
}

async function macosAlert(
  title: string,
  message: string,
  as: "critical" | "warning" | "informational",
  buttons: string[],
  defaultButton: string
) {
  const e = await spawnSync("osascript", [
    "-e",
    `display alert "${title}" message "${message}" as ${as} buttons {"${buttons.join(
      '", "'
    )}"} default button "${defaultButton || buttons[0]}"`,
  ]);

  return e.stdout.toString().trim().split(":")[1].trim();
}

cli().then(() => {
  main();
});
