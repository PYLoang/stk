import Link from "next/link";
import { fmtDateTime, money, num } from "@/lib/format";
import { BarChart } from "@/components/bar-chart";

export const FLOW_DAYS = 7;

export type DashboardData = Awaited<ReturnType<typeof loadDashboardData>>;

export async function loadDashboardData() {
  const { prisma } = await import("@/lib/prisma");
  const today = new Date();
  const flowStart = new Date(today);
  flowStart.setHours(0, 0, 0, 0);
  flowStart.setDate(flowStart.getDate() - (FLOW_DAYS - 1));

  const [stocks, categoryCount, movements, txns, totalUnitsAgg, flowTxns] = await Promise.all([
    prisma.stock.findMany({ include: { category: true } }),
    prisma.category.count(),
    prisma.movement.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.txn.findMany({
      include: { stock: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.stock.aggregate({ _sum: { quantity: true } }),
    prisma.txn.findMany({ where: { createdAt: { gte: flowStart } } }),
  ]);

  const totalValue = stocks.reduce((sum, s) => sum + s.quantity * s.price, 0);
  const totalUnits = totalUnitsAgg._sum.quantity ?? 0;
  const lowItems = stocks.filter((s) => s.quantity <= s.lowAt);

  const isSameDay = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const todayImports = movements.filter((m) => m.type === "IMPORT" && isSameDay(m.createdAt)).length;
  const todayExports = movements.filter((m) => m.type === "EXPORT" && isSameDay(m.createdAt)).length;

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
    stocks,
    categoryCount,
    movements,
    txns,
    totalValue,
    totalSkus: stocks.length,
    totalUnits,
    lowItems,
    todayImports,
    todayExports,
    flowSeries,
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
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, marginTop: 24 }}>
      <div className="panel">
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
        <div className="panel-body">
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
          {lowItems.slice(0, 7).map((s) => (
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
          {lowItems.length === 0 && (
            <div className="muted" style={{ padding: 24, textAlign: "center", fontSize: 13 }}>
              Everything well stocked.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecentActivity({ data }: { data: DashboardData }) {
  const { movements, txns } = data;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginTop: 24 }}>
      <div className="panel">
        <div className="panel-h">
          <div className="ttl">Recent movements</div>
          <Link href="/movements" className="btn btn--ghost btn--sm">
            View all →
          </Link>
        </div>
        {movements.length === 0 ? (
          <div className="muted" style={{ padding: 32, textAlign: "center", fontSize: 13 }}>
            No movements yet.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 30 }}></th>
                <th>Code</th>
                <th>Remark</th>
                <th className="right">Items</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>
                    <i
                      className={
                        m.type === "IMPORT"
                          ? "fa-solid fa-arrow-right-to-bracket"
                          : "fa-solid fa-arrow-right-from-bracket"
                      }
                      style={{
                        fontSize: 13,
                        color: m.type === "IMPORT" ? "var(--pos)" : "var(--neg)",
                      }}
                      aria-hidden
                    />
                  </td>
                  <td className="num">{m.code}</td>
                  <td
                    className="nowrap"
                    style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {m.remark || <span className="faint">—</span>}
                  </td>
                  <td className="right num">{m.items.length}</td>
                  <td className="num muted nowrap">{fmtDateTime(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="panel-h">
          <div className="ttl">Latest transactions</div>
          <Link href="/transactions" className="btn btn--ghost btn--sm">
            View all →
          </Link>
        </div>
        <div>
          {txns.length === 0 ? (
            <div className="muted" style={{ padding: 32, textAlign: "center", fontSize: 13 }}>
              No transactions yet.
            </div>
          ) : (
            txns.map((t) => {
              const ttl = t.stock ? t.stock.name : t.subject;
              return (
                <div
                  key={t.id}
                  className="row between"
                  style={{ padding: "12px 18px", borderBottom: "1px solid var(--rule-2)" }}
                >
                  <div className="row gap-8" style={{ flex: 1, minWidth: 0 }}>
                    <span className={t.type === "IMPORT" ? "pill pill--in" : "pill pill--out"}>
                      {t.type === "IMPORT" ? "IN" : "OUT"}
                    </span>
                    <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ttl}
                      </span>
                      <span className="muted" style={{ fontSize: 11 }}>
                        {t.stock ? "Stock" : "Subject"}
                      </span>
                    </div>
                  </div>
                  <div className="col" style={{ alignItems: "flex-end", gap: 2 }}>
                    <span className="mono tnum" style={{ fontWeight: 500 }}>
                      {money(t.quantity * t.price)}
                    </span>
                    <span className="muted mono" style={{ fontSize: 11 }}>
                      {t.quantity} × {money(t.price)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
