import Link from "next/link";
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
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">03 · EDIT</span>
          <h1 className="h-1">{category.name}</h1>
        </div>
        <Link href="/categories" className="btn btn--ghost">Cancel</Link>
      </div>
      <CategoryForm action={action} category={category} />
    </div>
  );
}
