import Link from "next/link";
import { createStock } from "@/actions/stock";
import { StockForm } from "@/components/forms/stock-form";
import { prisma } from "@/lib/prisma";

export default async function NewStockPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New Stock</h1>
        <p className="mt-2 text-slate-600">Create an inventory item.</p>
      </div>
      {categories.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Create a <Link className="underline" href="/categories/new">category</Link> before adding stock.
        </p>
      ) : (
        <StockForm action={createStock} categories={categories} />
      )}
    </div>
  );
}
