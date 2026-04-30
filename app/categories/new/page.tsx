import Link from "next/link";
import { createCategory } from "@/actions/category";
import { CategoryForm } from "@/components/forms/category-form";

export default function NewCategoryPage() {
  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">03 · NEW</span>
          <h1 className="h-1">New category</h1>
        </div>
        <Link href="/categories" className="btn btn--ghost">Cancel</Link>
      </div>
      <CategoryForm action={createCategory} />
    </div>
  );
}
