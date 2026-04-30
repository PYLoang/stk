import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { dateTime, money } from "@/lib/format";

export default async function Home() {
  const [stockCount, categoryCount, lowStocks, movements, txns] = await Promise.all([
    prisma.stock.count(),
    prisma.category.count(),
    prisma.stock.findMany({
      where: { quantity: { lte: 10 } },
      include: { category: true },
      orderBy: { quantity: "asc" },
      take: 5,
    }),
    prisma.movement.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.txn.findMany({
      include: { stock: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalUnits = await prisma.stock.aggregate({ _sum: { quantity: true } });

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-slate-600">Inventory, stock movements, and transaction activity.</p>
        </div>
        <Link className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white" href="/stocks/new">
          New stock
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Stock records</p>
          <p className="mt-2 text-3xl font-semibold">{stockCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Categories</p>
          <p className="mt-2 text-3xl font-semibold">{categoryCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Units on hand</p>
          <p className="mt-2 text-3xl font-semibold">{totalUnits._sum.quantity ?? 0}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">Low Stock</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStocks.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No low-stock items.</p>
            ) : (
              lowStocks.map((stock) => (
                <div key={stock.id} className="flex items-center justify-between p-5 text-sm">
                  <div>
                    <p className="font-medium">{stock.name}</p>
                    <p className="text-slate-500">{stock.category.name}</p>
                  </div>
                  <span className="font-semibold">{stock.quantity}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">Recent Movements</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {movements.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No movements yet.</p>
            ) : (
              movements.map((movement) => (
                <Link
                  key={movement.id}
                  href={`/movements/${movement.id}`}
                  className="flex items-center justify-between p-5 text-sm hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium">{movement.code}</p>
                    <p className="text-slate-500">{dateTime(movement.createdAt)}</p>
                  </div>
                  <span>{movement.items.length} items</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {txns.map((txn) => (
                <tr key={txn.id}>
                  <td className="px-5 py-3">{txn.stock?.name ?? txn.subject}</td>
                  <td className="px-5 py-3">{txn.type}</td>
                  <td className="px-5 py-3">{txn.quantity}</td>
                  <td className="px-5 py-3">{money(txn.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
