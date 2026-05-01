import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  "Stationery",
  "Accessories",
  "Beverages",
  "Bakery",
  "Cleaning",
  "Packaging",
];

const STOCK_TEMPLATES: { name: string; category: string; price: number; unit: string }[] = [
  { name: "A5 Notebook", category: "Stationery", price: 45, unit: "pc" },
  { name: "A4 Notebook", category: "Stationery", price: 65, unit: "pc" },
  { name: "Blue Pen", category: "Stationery", price: 12, unit: "pc" },
  { name: "Black Pen", category: "Stationery", price: 12, unit: "pc" },
  { name: "Red Pen", category: "Stationery", price: 12, unit: "pc" },
  { name: "Highlighter", category: "Stationery", price: 25, unit: "pc" },
  { name: "Eraser", category: "Stationery", price: 8, unit: "pc" },
  { name: "Sticky Notes", category: "Stationery", price: 35, unit: "pack" },
  { name: "Stapler", category: "Stationery", price: 120, unit: "pc" },
  { name: "Tape Roll", category: "Stationery", price: 18, unit: "pc" },
  { name: "Phone Strap", category: "Accessories", price: 89, unit: "pc" },
  { name: "Lanyard", category: "Accessories", price: 45, unit: "pc" },
  { name: "Keychain", category: "Accessories", price: 30, unit: "pc" },
  { name: "USB Cable", category: "Accessories", price: 150, unit: "pc" },
  { name: "Earbuds", category: "Accessories", price: 590, unit: "pc" },
  { name: "Phone Case", category: "Accessories", price: 220, unit: "pc" },
  { name: "Latte Beans 1kg", category: "Beverages", price: 480, unit: "kg" },
  { name: "Espresso Beans 1kg", category: "Beverages", price: 520, unit: "kg" },
  { name: "Whole Milk 1L", category: "Beverages", price: 55, unit: "L" },
  { name: "Oat Milk 1L", category: "Beverages", price: 95, unit: "L" },
  { name: "Sugar Syrup", category: "Beverages", price: 80, unit: "btl" },
  { name: "Croissant", category: "Bakery", price: 55, unit: "pc" },
  { name: "Pain au Chocolat", category: "Bakery", price: 65, unit: "pc" },
  { name: "Sourdough Loaf", category: "Bakery", price: 120, unit: "pc" },
  { name: "Cinnamon Roll", category: "Bakery", price: 70, unit: "pc" },
  { name: "Brownie", category: "Bakery", price: 60, unit: "pc" },
  { name: "Dish Soap", category: "Cleaning", price: 75, unit: "btl" },
  { name: "Sponges", category: "Cleaning", price: 45, unit: "pack" },
  { name: "Paper Towels", category: "Cleaning", price: 90, unit: "pack" },
  { name: "Trash Bags", category: "Cleaning", price: 110, unit: "pack" },
  { name: "Glass Cleaner", category: "Cleaning", price: 85, unit: "btl" },
  { name: "Small Cup", category: "Packaging", price: 1.8, unit: "pc" },
  { name: "Medium Cup", category: "Packaging", price: 2.4, unit: "pc" },
  { name: "Large Cup", category: "Packaging", price: 3, unit: "pc" },
  { name: "Cup Lid", category: "Packaging", price: 0.9, unit: "pc" },
  { name: "Paper Bag Sm", category: "Packaging", price: 2.2, unit: "pc" },
  { name: "Paper Bag Lg", category: "Packaging", price: 3.5, unit: "pc" },
];

const REMARKS_IN = [
  "Weekly delivery — Maison Demarie",
  "Saturday market batch",
  "Restock from supplier A",
  "Specialty restock",
  "Packaging top-up",
  "Bulk order arrival",
];
const REMARKS_OUT = [
  "Wedding order — Aldridge",
  "Counter sales",
  "Catering pickup",
  "Walk-in batch",
  "Cafe service",
  "Office order",
];
const SUBJECTS_OUT = ["Shop rent", "Utility — Electric", "Internet bill", "Cleaning service", "Insurance"];
const SUBJECTS_IN = ["Cash deposit", "Refund — supplier", "Cake commission", "Catering deposit"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateWithinLast(days: number) {
  const now = Date.now();
  const start = now - days * 86400000;
  const t = start + Math.random() * (now - start);
  return new Date(t);
}

async function main() {
  console.log("Wiping existing data…");
  await prisma.txn.deleteMany();
  await prisma.movementItem.deleteMany();
  await prisma.movement.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.category.deleteMany();

  console.log("Creating categories…");
  const cats: Record<string, string> = {};
  for (const name of CATEGORIES) {
    const c = await prisma.category.create({ data: { name } });
    cats[name] = c.id;
  }

  console.log("Creating stocks…");
  const stocks: { id: string; price: number }[] = [];
  for (const t of STOCK_TEMPLATES) {
    // ~20% of stocks should be at or below their lowAt
    const lowAt = rand(8, 25);
    const isLow = Math.random() < 0.2;
    const quantity = isLow ? rand(0, lowAt) : rand(lowAt + 5, lowAt + 200);
    const s = await prisma.stock.create({
      data: {
        name: t.name,
        categoryId: cats[t.category],
        price: t.price,
        unit: t.unit,
        lowAt,
        quantity,
      },
    });
    stocks.push({ id: s.id, price: t.price });
  }

  console.log("Creating movements…");
  // 30 movements across last 7 days
  for (let i = 0; i < 30; i++) {
    const type = Math.random() < 0.55 ? "IMPORT" : "EXPORT";
    const createdAt = dateWithinLast(7);
    const code = `MV-${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(
      createdAt.getDate(),
    ).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`;
    const itemCount = rand(1, 5);
    const picked = new Set<string>();
    const items: { stockId: string; quantity: number }[] = [];
    while (items.length < itemCount) {
      const s = pick(stocks);
      if (picked.has(s.id)) continue;
      picked.add(s.id);
      items.push({ stockId: s.id, quantity: rand(1, 12) });
    }
    await prisma.movement.create({
      data: {
        code,
        type,
        remark: type === "IMPORT" ? pick(REMARKS_IN) : pick(REMARKS_OUT),
        createdAt,
        items: { create: items },
      },
    });
  }

  console.log("Creating transactions…");
  // 50 transactions across last 7 days
  for (let i = 0; i < 50; i++) {
    const type = Math.random() < 0.55 ? "IMPORT" : "EXPORT";
    const createdAt = dateWithinLast(7);
    // 70% tied to a stock, 30% subject-only
    if (Math.random() < 0.7) {
      const s = pick(stocks);
      await prisma.txn.create({
        data: {
          stockId: s.id,
          type,
          quantity: rand(1, 8),
          price: s.price,
          createdAt,
        },
      });
    } else {
      await prisma.txn.create({
        data: {
          subject: type === "IMPORT" ? pick(SUBJECTS_IN) : pick(SUBJECTS_OUT),
          type,
          quantity: 1,
          price: rand(80, 5500),
          createdAt,
        },
      });
    }
  }

  const counts = {
    categories: await prisma.category.count(),
    stocks: await prisma.stock.count(),
    movements: await prisma.movement.count(),
    txns: await prisma.txn.count(),
  };
  console.log("Done:", counts);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
