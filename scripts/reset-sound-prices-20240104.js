const { PrismaClient } = require("@prisma/client");

async function exec() {
  const prisma = new PrismaClient();
  const sounds = await prisma.sound.findMany();

  for (const sound of sounds) {
    await prisma.sound.update({
      where: {
        id: sound.id,
      },
      data: {
        price: 0,
        priceBits: 0,
      },
    });
    console.log(`Updated sound ${sound.id}`);
  }
}

exec();
