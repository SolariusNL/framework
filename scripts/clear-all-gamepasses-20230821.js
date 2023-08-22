const { PrismaClient } = require("@prisma/client");

const client = new PrismaClient();
client.gamepass.deleteMany({}).then(() => {
  console.log("All gamepasses deleted");
});
