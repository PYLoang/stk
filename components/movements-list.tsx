"use client";

import { useMemo, useState } from "react";
import { Sheet } from "./sheet";
import { fmtDate, fmtTime, money } from "@/lib/format";

type Item = {
  id: string;
  quantity: number;
  stock: { id: string; name: string; price: number; category: { name: string } } & Record<string, unknown>;
};

type Movement = {
  id: string;
  code: string;
  type: string;
  remark: string | null;
  createdAt: Date | string;
  items: Item[];
};

type Props = {
  movements: Movement[];
  newButtonLabel: string;
  newSheet: React.ReactNode;
};

export function MovementsList({ movements, newButtonLabel, newSheet }: Props) {
  const [newOpen, setNewOpen] = useState(false);
  const [infoId, setInfoId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "IMPORT" | "EXPORT">("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const counts = useMemo(() => ({
    all: movements.length,
    IMPORT: movements.filter((m) => m.type === "IMPORT").length,
    EXPORT: movements.filter((m) => m.type === "EXPORT").length,
  }), [movements]);

  const visible = useMemo(() => {
    const base = movements.filter((m) => {
      if (filter !== "all" && m.type !== filter) return false;
      if (!q) return true;
      const ql = q.toLowerCase();
      return m.code.toLowerCase().includes(ql) || (m.remark ?? "").toLowerCase().includes(ql);
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      const av = new Date(a.createdAt).getTime();
      const bv = new Date(b.createdAt).getTime();
      return (av - bv) * dir;
    });
  }, [movements, q, filter, sortDir]);

  const active = movements.find((m) => m.id === infoId) ?? null;
  const activeValue = active
    ? active.items.reduce((sum, it) => sum + it.stock.price * it.quantity, 0)
    : 0;

  return (
    <>
      <div className="row between" style={{ alignItems: "flex-start", marginBottom: 24 }}>
        <div className="filterbar" style={{ padding: 0, flex: 1 }}>
          <label className="search">
            <i className="fa-solid fa-magnifying-glass muted" style={{ fontSize: 11 }} aria-hidden />
            <input
              placeholder="Search by code or remark…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <button className="chip" data-active={filter === "all" ? 1 : 0} onClick={() => setFilter("all")}>
            All <span className="ct">{String(counts.all).padStart(2, "0")}</span>
          </button>
          <button className="chip" data-active={filter === "IMPORT" ? 1 : 0} onClick={() => setFilter("IMPORT")}>
            Imports <span className="ct">{String(counts.IMPORT).padStart(2, "0")}</span>
          </button>
          <button className="chip" data-active={filter === "EXPORT" ? 1 : 0} onClick={() => setFilter("EXPORT")}>
            Exports <span className="ct">{String(counts.EXPORT).padStart(2, "0")}</span>
          </button>
          <button className="chip" onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}>
            Date {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
        <button className="btn btn--primary" onClick={() => setNewOpen(true)}>
          {newButtonLabel}
        </button>
      </div>

      <div>
        {visible.length === 0 ? (
          <div className="muted" style={{ padding: 32, textAlign: "center", fontSize: 13 }}>
            {movements.length === 0 ? "No movements yet." : "No movements match your filter."}
          </div>
        ) : (
          visible.map((m) => {
            const visibleTags = m.items.slice(0, 4);
            const overflow = m.items.length - visibleTags.length;
            const created = typeof m.createdAt === "string" ? new Date(m.createdAt) : m.createdAt;
            return (
              <div key={m.id} className="mv-row" onClick={() => setInfoId(m.id)}>
                <div>
                  <span className={m.type === "IMPORT" ? "pill pill--in" : "pill pill--out"}>
                    <i className={m.type === "IMPORT" ? "fa-solid fa-arrow-down" : "fa-solid fa-arrow-up"} />
                    {m.type === "IMPORT" ? "IMPORT" : "EXPORT"}
                  </span>
                </div>
                <div>
                  <div className="code">{m.code}</div>
                  <div className="when">{fmtDate(created)} · {fmtTime(created)}</div>
                </div>
                <div className="col" style={{ gap: 8, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>
                    {m.remark || <span className="faint">—</span>}
                  </div>
                  {m.items.length > 0 && (
                    <div className="item-tag-row">
                      {visibleTags.map((it) => (
                        <span key={it.id} className="item-tag">{it.stock.name}</span>
                      ))}
                      {overflow > 0 && <span className="item-tag">+{overflow}</span>}
                    </div>
                  )}
                </div>
                <div className="mv-row-go" aria-hidden>
                  <i className="fa-solid fa-chevron-right" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <Sheet open={newOpen} onClose={() => setNewOpen(false)} eyebrow="04 · Movements" title="New stock movement">
        {newSheet}
      </Sheet>

      <Sheet
        open={!!active}
        onClose={() => setInfoId(null)}
        eyebrow="04 · Movements"
        title={active?.code ?? ""}
      >
        {active && (
          <div className="col gap-24">
            <div className="row gap-24">
              <div className="col" style={{ gap: 4 }}>
                <span className="eyebrow">Type</span>
                <span className={active.type === "IMPORT" ? "pill pill--in" : "pill pill--out"}>{active.type}</span>
              </div>
              <div className="col" style={{ gap: 4 }}>
                <span className="eyebrow">Posted</span>
                <span className="mono" style={{ fontSize: 13 }}>
                  {fmtDate(typeof active.createdAt === "string" ? new Date(active.createdAt) : active.createdAt)} ·{" "}
                  {fmtTime(typeof active.createdAt === "string" ? new Date(active.createdAt) : active.createdAt)}
                </span>
              </div>
              <div className="col" style={{ gap: 4 }}>
                <span className="eyebrow">Items</span>
                <span className="mono" style={{ fontSize: 13 }}>{active.items.length}</span>
              </div>
              <div className="col" style={{ gap: 4 }}>
                <span className="eyebrow">Value</span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{money(activeValue)}</span>
              </div>
            </div>

            <div>
              <div className="eyebrow mb-8">Remark</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {active.remark || <span className="muted" style={{ fontWeight: 400 }}>—</span>}
              </div>
            </div>

            <div>
              <div className="eyebrow mb-8">Items</div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="right">Qty</th>
                    <th className="right">Unit price</th>
                    <th className="right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {active.items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <div className="col" style={{ gap: 2 }}>
                          <span style={{ fontWeight: 500 }}>{it.stock.name}</span>
                          <span className="muted mono" style={{ fontSize: 11 }}>
                            {it.stock.category.name}
                          </span>
                        </div>
                      </td>
                      <td className="right num">{it.quantity}</td>
                      <td className="right num">{money(it.stock.price)}</td>
                      <td className="right num">{money(it.stock.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
