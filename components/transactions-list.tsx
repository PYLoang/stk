"use client";

import { useMemo, useState } from "react";
import { Sheet } from "./sheet";
import { deleteTxn } from "@/actions/txn";
import { fmtDate, fmtTime, money } from "@/lib/format";

type Txn = {
  id: string;
  type: string;
  quantity: number;
  price: number;
  subject: string | null;
  stockId: string | null;
  stock: { id: string; name: string } | null;
  createdAt: Date | string;
};

type SortKey = "subject" | "type" | "quantity" | "price" | "value" | "createdAt";

type Props = {
  txns: Txn[];
  newSheet: React.ReactNode;
};

export function TransactionsList({ txns, newSheet }: Props) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "IMPORT" | "EXPORT">("all");
  const [mode, setMode] = useState<"all" | "stock" | "subject">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [newOpen, setNewOpen] = useState(false);

  const counts = useMemo(() => ({
    all: txns.length,
    IMPORT: txns.filter((t) => t.type === "IMPORT").length,
    EXPORT: txns.filter((t) => t.type === "EXPORT").length,
    stock: txns.filter((t) => t.stockId).length,
    subject: txns.filter((t) => !t.stockId).length,
  }), [txns]);

  const visible = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const filtered = txns.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (mode === "stock" && !t.stockId) return false;
      if (mode === "subject" && t.stockId) return false;
      if (!ql) return true;
      const label = (t.stock?.name ?? t.subject ?? "").toLowerCase();
      return label.includes(ql);
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortKey) {
        case "subject":
          av = (a.stock?.name ?? a.subject ?? "").toLowerCase();
          bv = (b.stock?.name ?? b.subject ?? "").toLowerCase();
          break;
        case "type": av = a.type; bv = b.type; break;
        case "quantity": av = a.quantity; bv = b.quantity; break;
        case "price": av = a.price; bv = b.price; break;
        case "value": av = a.price * a.quantity; bv = b.price * b.quantity; break;
        case "createdAt":
          av = new Date(a.createdAt).getTime();
          bv = new Date(b.createdAt).getTime();
          break;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [txns, q, type, mode, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "createdAt" ? "desc" : "asc"); }
  };
  const sortArr = (k: SortKey) => sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <div className="row between" style={{ alignItems: "flex-end", marginBottom: 18, gap: 24, flexWrap: "wrap" }}>
        <div className="page-title">
          <span className="num">05</span>
          <h1 className="h-1">Transactions</h1>
          <span className="muted mono" style={{ fontSize: 12 }}>
            · {visible.length} of {txns.length}
          </span>
        </div>
        <button className="btn btn--primary" onClick={() => setNewOpen(true)}>
          <i className="fa-solid fa-plus" /> New transaction
        </button>
      </div>

      <div className="filterbar" style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 14, marginBottom: 14 }}>
        <label className="search">
          <i className="fa-solid fa-magnifying-glass muted" style={{ fontSize: 11 }} aria-hidden />
          <input placeholder="Search by subject or stock…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button className="chip" data-active={type === "all" ? 1 : 0} onClick={() => setType("all")}>
          All <span className="ct">{pad(counts.all)}</span>
        </button>
        <button className="chip" data-active={type === "IMPORT" ? 1 : 0} onClick={() => setType("IMPORT")}>
          Imports <span className="ct">{pad(counts.IMPORT)}</span>
        </button>
        <button className="chip" data-active={type === "EXPORT" ? 1 : 0} onClick={() => setType("EXPORT")}>
          Exports <span className="ct">{pad(counts.EXPORT)}</span>
        </button>
        <span className="divider--v" style={{ width: 1, height: 18, background: "var(--rule)" }} />
        <button className="chip" data-active={mode === "stock" ? 1 : 0} onClick={() => setMode(mode === "stock" ? "all" : "stock")}>
          Stock <span className="ct">{pad(counts.stock)}</span>
        </button>
        <button className="chip" data-active={mode === "subject" ? 1 : 0} onClick={() => setMode(mode === "subject" ? "all" : "subject")}>
          Subject <span className="ct">{pad(counts.subject)}</span>
        </button>
      </div>

      <div className="panel">
        {visible.length === 0 ? (
          <div className="muted" style={{ padding: 32, textAlign: "center", fontSize: 13 }}>
            {txns.length === 0 ? "No transactions yet." : "No transactions match your filter."}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th onClick={() => toggleSort("type")} style={{ cursor: "pointer", width: 90 }}>Type{sortArr("type")}</th>
                <th onClick={() => toggleSort("subject")} style={{ cursor: "pointer" }}>Subject{sortArr("subject")}</th>
                <th className="right" onClick={() => toggleSort("quantity")} style={{ cursor: "pointer" }}>Qty{sortArr("quantity")}</th>
                <th className="right" onClick={() => toggleSort("price")} style={{ cursor: "pointer" }}>Unit price{sortArr("price")}</th>
                <th className="right" onClick={() => toggleSort("value")} style={{ cursor: "pointer" }}>Value{sortArr("value")}</th>
                <th className="nowrap" onClick={() => toggleSort("createdAt")} style={{ cursor: "pointer" }}>Posted{sortArr("createdAt")}</th>
                <th className="right" style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => {
                const ttl = t.stock ? t.stock.name : t.subject;
                const created = typeof t.createdAt === "string" ? new Date(t.createdAt) : t.createdAt;
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
                    <td className="num muted nowrap">{fmtDate(created)} · {fmtTime(created)}</td>
                    <td className="right">
                      <div className="row-actions">
                        <form action={deleteTxn}>
                          <input type="hidden" name="id" value={t.id} />
                          <button
                            className="btn btn--danger btn--icon"
                            type="submit"
                            aria-label="Delete"
                            title="Delete"
                          >
                            <i className="fa-regular fa-trash-can" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Sheet open={newOpen} onClose={() => setNewOpen(false)} eyebrow="05 · Transactions" title="New transaction">
        {newSheet}
      </Sheet>
    </>
  );
}
