import { notFound } from "next/navigation";
import { dateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function MovementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movement = await prisma.movement.findUnique({
    where: { id },
    include: { items: { include: { stock: { include: { category: true } } } } },
  });

  if (!movement) notFound();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{movement.code}</h1>
        <p className="mt-2 text-slate-600">
          {movement.type} created {dateTime(movement.createdAt)}
        </p>
      </div>
      {movement.remark ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">{movement.remark}</p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movement.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3 font-medium">{item.stock.name}</td>
                <td className="px-5 py-3">{item.stock.category.name}</td>
                <td className="px-5 py-3">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
