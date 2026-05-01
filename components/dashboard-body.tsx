import Link from "next/link";
import { money, num } from "@/lib/format";
import { BarChart } from "@/components/bar-chart";
import { DashboardMovementsList } from "@/components/dashboard-movements-list";
import { DashboardTxnsList } from "@/components/dashboard-txns-list";
import { PAGE_SIZE, type MovementRow, type TxnRow } from "@/app/actions/dashboard-types";

export const FLOW_DAYS = 7;

export type DashboardData = Awaited<ReturnType<typeof loadDashboardData>>;

export async function loadDashboardData() {
  const { prisma } = await import("@/lib/prisma");
  const today = new Date();
  const flowStart = new Date(today);
  flowStart.setHours(0, 0, 0, 0);
  flowStart.setDate(flowStart.getDate() - (FLOW_DAYS - 1));

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const [
    stocks,
    categoryCount,
    initialMovements,
    initialTxns,
    totalUnitsAgg,
    flowTxns,
    todayImports,
    todayExports,
  ] = await Promise.all([
    prisma.stock.findMany({ include: { category: true } }),
    prisma.category.count(),
    prisma.movement.findMany({
      include: { items: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
    }),
    prisma.txn.findMany({
      include: { stock: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
    }),
    prisma.stock.aggregate({ _sum: { quantity: true } }),
    prisma.txn.findMany({ where: { createdAt: { gte: flowStart } } }),
    prisma.movement.count({
      where: { type: "IMPORT", createdAt: { gte: todayStart, lt: tomorrowStart } },
    }),
    prisma.movement.count({
      where: { type: "EXPORT", createdAt: { gte: todayStart, lt: tomorrowStart } },
    }),
  ]);

  const totalValue = stocks.reduce((sum, s) => sum + s.quantity * s.price, 0);
  const totalUnits = totalUnitsAgg._sum.quantity ?? 0;
  const lowItems = stocks.filter((s) => s.quantity <= s.lowAt);

  const movementsHasMore = initialMovements.length > PAGE_SIZE;
  const movementsPage = movementsHasMore ? initialMovements.slice(0, PAGE_SIZE) : initialMovements;
  const movementRows: MovementRow[] = movementsPage.map((m) => ({
    id: m.id,
    code: m.code,
    type: m.type,
    remark: m.remark,
    createdAt: m.createdAt,
    itemCount: m.items.length,
  }));
  const movementsCursor = movementsHasMore ? movementsPage[movementsPage.length - 1].id : null;

  const txnsHasMore = initialTxns.length > PAGE_SIZE;
  const txnsPage = txnsHasMore ? initialTxns.slice(0, PAGE_SIZE) : initialTxns;
  const txnRows: TxnRow[] = txnsPage.map((t) => ({
    id: t.id,
    type: t.type,
    quantity: t.quantity,
    price: t.price,
    subject: t.subject,
    createdAt: t.createdAt,
    stock: t.stock ? { id: t.stock.id, name: t.stock.name } : null,
  }));
  const txnsCursor = txnsHasMore ? txnsPage[txnsPage.length - 1].id : null;

  const flowSeries = Array.from({ length: FLOW_DAYS }, (_, i) => {
    const d = new Date(flowStart);
    d.setDate(flowStart.getDate() + i);
    return { day: d.getDate(), month: d.getMonth() + 1, in: 0, out: 0 };
  });
  for (const t of flowTxns) {
    const dayIdx = Math.floor((t.createdAt.getTime() - flowStart.getTime()) / 86400000);
    if (dayIdx < 0 || dayIdx >= FLOW_DAYS) continue;
    const value = t.quantity * t.price;
    if (t.type === "IMPORT") flowSeries[dayIdx].in += value;
    else flowSeries[dayIdx].out += value;
  }

  return {
    categoryCount,
    totalValue,
    totalSkus: stocks.length,
    totalUnits,
    lowItems,
    todayImports,
    todayExports,
    flowSeries,
    movementRows,
    movementsCursor,
    txnRows,
    txnsCursor,
  };
}

export function StatStrip({ data }: { data: DashboardData }) {
  const { categoryCount, totalValue, totalSkus, totalUnits, lowItems, todayImports, todayExports } =
    data;
  return (
    <div className="grid-bordered" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
      <div className="stat">
        <div className="stat-lbl">Stock value</div>
        <div className="stat-val">{money(totalValue)}</div>
        <div className="stat-sub">
          <span className="mono">{totalSkus}</span>
          <span>distinct SKUs</span>
        </div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Units on hand</div>
        <div className="stat-val">{num(totalUnits)}</div>
        <div className="stat-sub">
          <span>across {categoryCount} categor{categoryCount === 1 ? "y" : "ies"}</span>
        </div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Today&apos;s flow</div>
        <div className="stat-val">
          {todayImports}
          <span style={{ color: "var(--ink-4)", fontSize: 22 }}> in </span>
          {todayExports}
          <span style={{ color: "var(--ink-4)", fontSize: 22 }}> out</span>
        </div>
        <div className="stat-sub">
          <span>movements posted today</span>
        </div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Low-stock alerts</div>
        <div className="stat-val" style={{ color: lowItems.length ? "var(--warn)" : "var(--ink)" }}>
          {String(lowItems.length).padStart(2, "0")}
        </div>
        <div className="stat-sub">
          <span>items below threshold —</span>
          <Link href="/stocks" style={{ color: "var(--ink)", textDecoration: "underline" }}>
            review
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ChartAndLowStock({ data }: { data: DashboardData }) {
  const { lowItems, flowSeries } = data;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: 24,
        marginTop: 24,
        alignItems: "stretch",
      }}
    >
      <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
        <div className="panel-h">
          <div className="ttl" style={{ fontSize: 16 }}>
            Cash flow · last {FLOW_DAYS} days
          </div>
          <div className="row gap-16">
            <div className="row gap-4" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
              <span style={{ width: 10, height: 10, background: "var(--ink)" }}></span> Income
            </div>
            <div className="row gap-4" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
              <span
                style={{ width: 10, height: 10, background: "oklch(from var(--ink) l c h / 0.30)" }}
              ></span>{" "}
              Expenses
            </div>
          </div>
        </div>
        <div className="panel-body" style={{ flex: 1, minHeight: 0 }}>
          <BarChart data={flowSeries} h={260} />
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <div className="ttl">Low stock</div>
          <span className="muted mono" style={{ fontSize: 11 }}>
            {lowItems.length} items
          </span>
        </div>
        <div>
          {lowItems.length === 0 ? (
            <div className="muted" style={{ padding: 24, textAlign: "center", fontSize: 13 }}>
              Everything well stocked.
            </div>
          ) : (
            <div style={{ maxHeight: 5 * 62, overflowY: "auto" }}>
              {lowItems.map((s) => (
                <div
                  key={s.id}
                  className="row between"
                  style={{ padding: "12px 18px", borderBottom: "1px solid var(--rule-2)" }}
                >
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <span className="muted" style={{ fontSize: 11 }}>
                      {s.category.name}
                    </span>
                  </div>
                  <div className="row gap-8">
                    <span className="mono tnum" style={{ color: "var(--warn)" }}>
                      {s.quantity} {s.unit}
                    </span>
                    <span className="pill pill--low">low</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecentActivity({ data }: { data: DashboardData }) {
  const { movementRows, movementsCursor, txnRows, txnsCursor } = data;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginTop: 24 }}>
      <div className="panel">
        <div className="panel-h">
          <div className="ttl">Recent movements</div>
          <Link href="/movements" className="btn btn--ghost btn--sm">
            View all →
          </Link>
        </div>
        <DashboardMovementsList initial={movementRows} initialCursor={movementsCursor} />
      </div>

      <div className="panel">
        <div className="panel-h">
          <div className="ttl">Latest transactions</div>
          <Link href="/transactions" className="btn btn--ghost btn--sm">
            View all →
          </Link>
        </div>
        <DashboardTxnsList initial={txnRows} initialCursor={txnsCursor} />
      </div>
    </div>
  );
}
