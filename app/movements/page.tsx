import Link from "next/link";
import { dateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function MovementsPage() {
  const movements = await prisma.movement.findMany({
    include: { items: { include: { stock: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Movements</h1>
          <p className="mt-2 text-slate-600">Round-based stock import and export batches.</p>
        </div>
        <Link href="/movements/new" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
          New movement
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td className="px-5 py-3 font-medium">
                  <Link href={`/movements/${movement.id}`} className="underline">
                    {movement.code}
                  </Link>
                </td>
                <td className="px-5 py-3">{movement.type}</td>
                <td className="px-5 py-3">{movement.items.length}</td>
                <td className="px-5 py-3">{dateTime(movement.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {movements.length === 0 ? <p className="p-5 text-sm text-slate-500">No movements yet.</p> : null}
      </div>
    </div>
  );
}
