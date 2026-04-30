import { notFound } from "next/navigation";
import { updateStock } from "@/actions/stock";
import { StockForm } from "@/components/forms/stock-form";
import { prisma } from "@/lib/prisma";

export default async function EditStockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [stock, categories] = await Promise.all([
    prisma.stock.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!stock) notFound();

  const action = updateStock.bind(null, stock.id);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Stock</h1>
        <p className="mt-2 text-slate-600">Update item details and quantity.</p>
      </div>
      <StockForm action={action} categories={categories} stock={stock} />
    </div>
  );
}
