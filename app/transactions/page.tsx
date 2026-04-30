import Link from "next/link";
import { deleteTxn } from "@/actions/txn";
import { dateTime, money } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function TransactionsPage() {
  const txns = await prisma.txn.findMany({
    include: { stock: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-2 text-slate-600">Stock-linked and free-form transaction lines.</p>
        </div>
        <Link href="/transactions/new" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
          New transaction
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Quantity</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {txns.map((txn) => (
              <tr key={txn.id}>
                <td className="px-5 py-3 font-medium">{txn.stock?.name ?? txn.subject}</td>
                <td className="px-5 py-3">{txn.type}</td>
                <td className="px-5 py-3">{txn.quantity}</td>
                <td className="px-5 py-3">{money(txn.price)}</td>
                <td className="px-5 py-3">{dateTime(txn.createdAt)}</td>
                <td className="px-5 py-3">
                  <form action={deleteTxn}>
                    <input type="hidden" name="id" value={txn.id} />
                    <button className="text-red-700 underline" type="submit">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {txns.length === 0 ? <p className="p-5 text-sm text-slate-500">No transactions yet.</p> : null}
      </div>
    </div>
  );
}
