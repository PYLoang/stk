import { createCategory } from "@/actions/category";
import { CategoryForm } from "@/components/forms/category-form";
import { CategoriesList } from "@/components/categories-list";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { stocks: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="page">
      <CategoriesList
        categories={categories.map((c) => ({ id: c.id, name: c.name, stockCount: c._count.stocks }))}
        newSheet={<CategoryForm action={createCategory} />}
      />
    </div>
  );
}
