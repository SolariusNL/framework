import repl from "repl";
import logger from "./logger";
import prisma from "./prisma";

logger().info("Framework Next.js Shell");
logger().info(
  "Warning: Production use is discouraged. All code is executed in the context of the server."
);

const server = repl.start({
  prompt: "fw ~| >",
});
server.context.db = prisma;
