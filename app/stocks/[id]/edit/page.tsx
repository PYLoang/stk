import Link from "next/link";
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
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">02 · EDIT</span>
          <h1 className="h-1">{stock.name}</h1>
        </div>
        <Link href="/stocks" className="btn btn--ghost">Cancel</Link>
      </div>
      <StockForm action={action} categories={categories} stock={stock} />
    </div>
  );
}
