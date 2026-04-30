import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtDate, fmtTime, money, num } from "@/lib/format";

const LOW_THRESHOLD = 10;

export default async function Home() {
  const [stocks, categoryCount, movements, txns, totalUnitsAgg] = await Promise.all([
    prisma.stock.findMany({ include: { category: true } }),
    prisma.category.count(),
    prisma.movement.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.txn.findMany({
      include: { stock: true },
      orderBy: { createdAt: "desc" },
      take: 7,
    }),
    prisma.stock.aggregate({ _sum: { quantity: true } }),
  ]);

  const totalValue = stocks.reduce((sum, s) => sum + s.quantity * s.price, 0);
  const totalSkus = stocks.length;
  const totalUnits = totalUnitsAgg._sum.quantity ?? 0;
  const lowItems = stocks.filter((s) => s.quantity <= LOW_THRESHOLD);

  const today = new Date();
  const isSameDay = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const todayImports = movements.filter((m) => m.type === "IMPORT" && isSameDay(m.createdAt)).length;
  const todayExports = movements.filter((m) => m.type === "EXPORT" && isSameDay(m.createdAt)).length;

  const weekNumber = Math.ceil(((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7);
  const issue = String(today.getMonth() + 1).padStart(2, "0");

  return (
    <div className="page">
      {/* Heading */}
      <div className="page-h">
        <div>
          <div className="eyebrow mb-8">Issue {issue} — Week {weekNumber}, {today.getFullYear()}</div>
          <h1 className="h-display">
            Good day at the shop.
            <br />
            <span style={{ color: "var(--ink-3)" }}>
              {lowItems.length
                ? `${lowItems.length} item${lowItems.length === 1 ? "" : "s"} below threshold.`
                : "Inventory is in order."}
            </span>
          </h1>
        </div>
        <div className="col" style={{ alignItems: "flex-end", gap: 6 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            {today.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()} ·{" "}
            {today.getDate()} {today.toLocaleDateString("en-US", { month: "short" }).toUpperCase()} · {today.getFullYear()}
          </span>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>OPEN · 07:00 — 19:00</span>
        </div>
      </div>

      {/* Stat strip */}
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
          <div className="stat-lbl">Today's flow</div>
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
            <Link href="/stocks" style={{ color: "var(--ink)", textDecoration: "underline" }}>review</Link>
          </div>
        </div>
      </div>

      {/* Two-up: recent movements + low stock */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, marginTop: 24 }}>
        <div className="panel">
          <div className="panel-h">
            <div>
              <div className="ttl">Recent movements</div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>Latest import & export rounds</div>
            </div>
            <Link href="/movements" className="btn btn--ghost btn--sm">View all →</Link>
          </div>
          {movements.length === 0 ? (
            <div className="muted" style={{ padding: 32, textAlign: "center", fontSize: 13 }}>
              No movements yet.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Type</th>
                  <th>Code</th>
                  <th>Remark</th>
                  <th className="right">Items</th>
                  <th className="nowrap">Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className={m.type === "IMPORT" ? "pill pill--in" : "pill pill--out"}>
                        {m.type === "IMPORT" ? "IN" : "OUT"}
                      </span>
                    </td>
                    <td className="num">{m.code}</td>
                    <td className="nowrap" style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.remark || <span className="faint">—</span>}
                    </td>
                    <td className="right num">{m.items.length}</td>
                    <td className="num muted nowrap">{fmtDate(m.createdAt)} · {fmtTime(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-h">
            <div className="ttl">Low stock</div>
            <span className="muted mono" style={{ fontSize: 11 }}>{lowItems.length} items</span>
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
                  <span className="muted" style={{ fontSize: 11 }}>{s.category.name}</span>
                </div>
                <div className="row gap-8">
                  <span className="mono tnum" style={{ color: "var(--warn)" }}>{s.quantity}</span>
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

      {/* Latest transactions */}
      <div className="panel mt-24">
        <div className="panel-h">
          <div className="ttl">Latest transactions</div>
          <Link href="/transactions" className="btn btn--ghost btn--sm">View all →</Link>
        </div>
        {txns.length === 0 ? (
          <div className="muted" style={{ padding: 32, textAlign: "center", fontSize: 13 }}>
            No transactions yet.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Type</th>
                <th>Subject</th>
                <th className="right">Qty</th>
                <th className="right">Unit price</th>
                <th className="right">Value</th>
                <th className="nowrap">Posted</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => {
                const ttl = t.stock ? t.stock.name : t.subject;
                return (
                  <tr key={t.id}>
                    <td>
                      <span className={t.type === "IMPORT" ? "pill pill--in" : "pill pill--out"}>
                        {t.type === "IMPORT" ? "IN" : "OUT"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{ttl}</span>{" "}
                      {!t.stock && <span className="muted" style={{ fontSize: 11 }}>· subject</span>}
                    </td>
                    <td className="right num">{t.quantity}</td>
                    <td className="right num">{money(t.price)}</td>
                    <td className="right num" style={{ fontWeight: 500 }}>{money(t.quantity * t.price)}</td>
                    <td className="num muted nowrap">{fmtDate(t.createdAt)} · {fmtTime(t.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
