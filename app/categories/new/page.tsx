import { createCategory } from "@/actions/category";
import { CategoryForm } from "@/components/forms/category-form";

export default function NewCategoryPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New Category</h1>
        <p className="mt-2 text-slate-600">Create a stock grouping.</p>
      </div>
      <CategoryForm action={createCategory} />
    </div>
  );
}
