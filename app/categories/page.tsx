import { createCategory } from "@/actions/category";
import { CategoryForm } from "@/components/forms/category-form";
import { CategoriesList } from "@/components/categories-list";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      stocks: { select: { quantity: true, price: true, lowAt: true } },
    },
    orderBy: { name: "asc" },
  });

  const items = categories.map((c) => ({
    id: c.id,
    name: c.name,
    stockCount: c.stocks.length,
    totalValue: c.stocks.reduce((sum, s) => sum + s.quantity * s.price, 0),
    lowCount: c.stocks.filter((s) => s.quantity <= s.lowAt).length,
  }));

  return (
    <div className="page">
      <CategoriesList
        categories={items}
        newSheet={<CategoryForm action={createCategory} />}
      />
    </div>
  );
}
