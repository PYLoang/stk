import Link from "next/link";
import { deleteStock } from "@/actions/stock";
import { money } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function StocksPage() {
  const stocks = await prisma.stock.findMany({
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Stocks</h1>
          <p className="mt-2 text-slate-600">Inventory records and current quantities.</p>
        </div>
        <Link href="/stocks/new" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
          New stock
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Quantity</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stocks.map((stock) => (
              <tr key={stock.id}>
                <td className="px-5 py-3 font-medium">{stock.name}</td>
                <td className="px-5 py-3">{stock.category.name}</td>
                <td className="px-5 py-3">{stock.quantity}</td>
                <td className="px-5 py-3">{money(stock.price)}</td>
                <td className="flex gap-3 px-5 py-3">
                  <Link className="text-slate-700 underline" href={`/stocks/${stock.id}/edit`}>
                    Edit
                  </Link>
                  <form action={deleteStock}>
                    <input type="hidden" name="id" value={stock.id} />
                    <button className="text-red-700 underline" type="submit">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stocks.length === 0 ? <p className="p-5 text-sm text-slate-500">No stocks yet.</p> : null}
      </div>
    </div>
  );
}
