import { createMovement } from "@/actions/movement";
import { MovementForm } from "@/components/forms/movement-form";
import { MovementsList } from "@/components/movements-list";
import { prisma } from "@/lib/prisma";

export default async function MovementsPage() {
  const [movements, stocks] = await Promise.all([
    prisma.movement.findMany({
      include: { items: { include: { stock: { include: { category: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stock.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">04</span>
          <h1 className="h-1">Movements</h1>
          <span className="muted" style={{ fontSize: 12 }}>
            · {movements.length} round{movements.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <MovementsList
        movements={movements}
        newButtonLabel="New movement"
        newSheet={
          stocks.length === 0 ? (
            <div className="muted">Create stock first.</div>
          ) : (
            <MovementForm action={createMovement} stocks={stocks} />
          )
        }
      />
    </div>
  );
}
