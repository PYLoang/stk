import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const stationery = await prisma.category.upsert({
    where: { name: "Stationery" },
    update: {},
    create: { name: "Stationery" },
  });

  const accessories = await prisma.category.upsert({
    where: { name: "Accessories" },
    update: {},
    create: { name: "Accessories" },
  });

  await prisma.stock.upsert({
    where: { id: "seed-pen-blue" },
    update: {},
    create: {
      id: "seed-pen-blue",
      name: "Blue Pen",
      quantity: 120,
      price: 12,
      categoryId: stationery.id,
    },
  });

  await prisma.stock.upsert({
    where: { id: "seed-notebook-a5" },
    update: {},
    create: {
      id: "seed-notebook-a5",
      name: "A5 Notebook",
      quantity: 36,
      price: 45,
      categoryId: stationery.id,
    },
  });

  await prisma.stock.upsert({
    where: { id: "seed-phone-strap" },
    update: {},
    create: {
      id: "seed-phone-strap",
      name: "Phone Strap",
      quantity: 18,
      price: 89,
      categoryId: accessories.id,
    },
  });

  await prisma.txn.upsert({
    where: { id: "seed-rent" },
    update: {},
    create: {
      id: "seed-rent",
      subject: "Shop rent",
      type: "EXPORT",
      quantity: 1,
      price: 5000,
      remark: "Monthly non-stock expense",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
