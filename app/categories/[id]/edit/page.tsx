import { notFound } from "next/navigation";
import { updateCategory } from "@/actions/category";
import { CategoryForm } from "@/components/forms/category-form";
import { prisma } from "@/lib/prisma";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) notFound();

  const action = updateCategory.bind(null, category.id);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Category</h1>
        <p className="mt-2 text-slate-600">Update category details.</p>
      </div>
      <CategoryForm action={action} category={category} />
    </div>
  );
}
