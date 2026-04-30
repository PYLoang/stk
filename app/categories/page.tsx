import Link from "next/link";
import { deleteCategory } from "@/actions/category";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { stocks: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-2 text-slate-600">Group stock records for easier browsing.</p>
        </div>
        <Link href="/categories/new" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
          New category
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Stocks</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-5 py-3 font-medium">{category.name}</td>
                <td className="px-5 py-3">{category._count.stocks}</td>
                <td className="flex gap-3 px-5 py-3">
                  <Link className="text-slate-700 underline" href={`/categories/${category.id}/edit`}>
                    Edit
                  </Link>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <button className="text-red-700 underline" type="submit">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 ? <p className="p-5 text-sm text-slate-500">No categories yet.</p> : null}
      </div>
    </div>
  );
}
