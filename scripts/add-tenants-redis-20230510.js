const { PrismaClient } = require("@prisma/client");

async function exec() {
  const prisma = new PrismaClient();
  const dbs = await prisma.redisDatabase.findMany();
  dbs.forEach(async (db) => {
    const randomWords = [
      "apple",
      "banana",
      "cherry",
      "date",
      "elderberry",
      "fig",
      "grape",
      "honeydew",
      "kiwi",
      "lemon",
      "mango",
      "nectarine",
      "orange",
      "papaya",
      "quince",
      "raspberry",
      "strawberry",
      "tangerine",
      "watermelon",
      "blueberry",
      "almond",
      "blackberry",
      "cantaloupe",
      "coconut",
      "dragonfruit",
      "grapefruit",
      "guava",
      "kiwifruit",
      "lime",
      "mulberry",
      "passionfruit",
      "peach",
      "pear",
      "pineapple",
      "plum",
      "pomegranate",
      "apricot",
      "avocado",
      "cranberry",
      "gooseberry",
      "lychee",
      "persimmon",
      "rhubarb",
      "starfruit",
      "boysenberry",
    ];

    const randomWord1 =
      randomWords[Math.floor(Math.random() * randomWords.length)];
    const randomWord2 =
      randomWords[Math.floor(Math.random() * randomWords.length)];
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    const phrase = `${randomWord1}-${randomWord2}-${randomNumber}`;

    await prisma.redisDatabase.update({
      where: {
        id: db.id,
      },
      data: {
        tenantPhrase: phrase,
      },
    });
  });
}

exec();
