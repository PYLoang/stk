import Link from "next/link";
import { createMovement } from "@/actions/movement";
import { MovementForm } from "@/components/forms/movement-form";
import { prisma } from "@/lib/prisma";

export default async function NewMovementPage() {
  const stocks = await prisma.stock.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">04 · NEW</span>
          <h1 className="h-1">New stock movement</h1>
        </div>
        <Link href="/movements" className="btn btn--ghost">Cancel</Link>
      </div>
      {stocks.length === 0 ? (
        <div className="panel">
          <div className="panel-body">
            Create <Link className="btn btn--ghost btn--sm" href="/stocks/new">stock</Link> before adding a movement.
          </div>
        </div>
      ) : (
        <MovementForm action={createMovement} stocks={stocks} />
      )}
    </div>
  );
}
