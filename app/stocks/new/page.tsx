import Link from "next/link";
import { createStock } from "@/actions/stock";
import { StockForm } from "@/components/forms/stock-form";
import { prisma } from "@/lib/prisma";

export default async function NewStockPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">02 · NEW</span>
          <h1 className="h-1">New stock</h1>
        </div>
        <Link href="/stocks" className="btn btn--ghost">Cancel</Link>
      </div>

      {categories.length === 0 ? (
        <div className="panel">
          <div className="panel-body">
            Create a <Link className="btn btn--ghost btn--sm" href="/categories/new">category</Link> before adding stock.
          </div>
        </div>
      ) : (
        <StockForm action={createStock} categories={categories} />
      )}
    </div>
  );
}
