const { PrismaClient, CatalogItemType } = require("@prisma/client");

const prisma = new PrismaClient();

async function generateTestData() {
  // Create a LimitedCatalogItem
  const limitedCatalogItem = await prisma.limitedCatalogItem.create({
    data: {
      name: "Limited Item",
      description: "This is a limited catalog item",
      price: 100,
      type: "type",
      previewUri: "/avatars/Emil.webp",
      stock: 37,
      type: CatalogItemType.HAT,
      recentAveragePrice: 0,
      rapLastUpdated:
        // 9999 years ago
        new Date(new Date().setFullYear(new Date().getFullYear() - 24)),
    },
  });

  // Generate 120 receipts with different timestamps
  const now = new Date();
  for (let i = 0; i < 120; i++) {
    const randomTimestamp = new Date(now.getTime() - i * 1000 * 60 * 60 * 24); // Decrease the time by one day for each receipt

    await prisma.limitedCatalogItemReceipt.create({
      data: {
        item: {
          connect: { id: limitedCatalogItem.id },
        },
        createdAt: randomTimestamp,
        salePrice: Math.floor(Math.random() * 100),
        buyer: {
          connect: { id: 1 }, // Replace with the actual buyer's ID
        },
      },
    });
  }
}

generateTestData()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
