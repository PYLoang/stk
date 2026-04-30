import Link from "next/link";
import { notFound } from "next/navigation";
import { MovementItemsTable } from "@/components/movement-items-table";
import { fmtDateTime, money } from "@/lib/format";
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

  const value = movement.items.reduce((sum, it) => sum + it.stock.price * it.quantity, 0);

  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">04 · DETAIL</span>
          <h1 className="h-1 mono" style={{ letterSpacing: 0 }}>{movement.code}</h1>
          <span className={movement.type === "IMPORT" ? "pill pill--in" : "pill pill--out"}>
            {movement.type}
          </span>
        </div>
        <Link href="/movements" className="btn btn--ghost">Back</Link>
      </div>

      <div className="grid-bordered" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
        <div className="stat">
          <div className="stat-lbl">Type</div>
          <div className="stat-val" style={{ fontSize: 24 }}>{movement.type}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Items</div>
          <div className="stat-val" style={{ fontSize: 24 }}>{movement.items.length}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Value</div>
          <div className="stat-val" style={{ fontSize: 24 }}>{money(value)}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Posted</div>
          <div className="stat-val mono" style={{ fontSize: 16, marginTop: 18 }}>
            {fmtDateTime(movement.createdAt)}
          </div>
        </div>
      </div>

      {movement.remark && (
        <div className="panel mb-24">
          <div className="panel-h">
            <div className="ttl">Remark</div>
          </div>
          <div className="panel-body">{movement.remark}</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-h">
          <div className="ttl">Items</div>
          <span className="muted mono" style={{ fontSize: 11 }}>{movement.items.length} line{movement.items.length === 1 ? "" : "s"}</span>
        </div>
        <MovementItemsTable items={movement.items} />
      </div>
    </div>
  );
}
