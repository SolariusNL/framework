const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const id = "0cf6a560-5bd6-4972-954b-bc2ee7a8d8aa";
  const days = 90;
  let date = new Date();

  for (let i = 0; i < days; i++) {
    // go 1 day back
    date.setDate(date.getDate() - 1);
    const purchasesToday = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < purchasesToday; j++) {
      const time = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        Math.floor(Math.random() * 12) + 8,
        Math.floor(Math.random() * 60)
      );
      const price = Math.floor(Math.random() * 7200) + 1;
      await prisma.limitedCatalogItemReceipt.create({
        data: {
          item: {
            connect: {
              id: id,
            },
          },
          salePrice: price,
          createdAt: time,
          buyer: {
            connect: {
              id: 3,
            },
          },
        },
      });
    }
  }
}

main();
