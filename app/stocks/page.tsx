import Link from "next/link";
import { createStock } from "@/actions/stock";
import { StockForm } from "@/components/forms/stock-form";
import { StocksList } from "@/components/stocks-list";
import { prisma } from "@/lib/prisma";

export default async function StocksPage() {
  const [stocksRaw, categories] = await Promise.all([
    prisma.stock.findMany({
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Normalize Prisma decimals/dates to plain shapes for the client component
  const stocks = stocksRaw.map((s) => ({
    id: s.id,
    name: s.name,
    quantity: s.quantity,
    price: Number(s.price),
    unit: s.unit,
    lowAt: s.lowAt,
    categoryId: s.categoryId,
    category: { id: s.category.id, name: s.category.name },
  }));

  return (
    <div className="page">
      <StocksList
        stocks={stocks}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        newSheet={
          categories.length === 0 ? (
            <div className="muted">
              Create a <Link className="btn btn--ghost btn--sm" href="/categories/new">category</Link> first.
            </div>
          ) : (
            <StockForm action={createStock} categories={categories} />
          )
        }
        bulkStocks={stocksRaw.map((s) => ({ id: s.id, name: s.name, quantity: s.quantity, unit: s.unit }))}
      />
    </div>
  );
}
