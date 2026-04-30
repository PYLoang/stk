"use client";

import { useMemo, useState } from "react";
import { Sheet } from "./sheet";
import { StockForm } from "./forms/stock-form";
import { money } from "@/lib/format";
import { deleteStock, updateStock } from "@/actions/stock";
import { MovementForm } from "./forms/movement-form";
import { createMovement } from "@/actions/movement";

type Stock = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
  lowAt: number;
  categoryId: string;
  category: { id: string; name: string };
};

type Category = { id: string; name: string };

type SortKey = "name" | "category" | "quantity" | "price" | "value";
type SortDir = "asc" | "desc";

type Props = {
  stocks: Stock[];
  categories: Category[];
  newSheet: React.ReactNode;
  bulkStocks?: Array<{ id: string; name: string; quantity: number; unit?: string }>;
};

export function StocksList({ stocks, categories, newSheet, bulkStocks }: Props) {
  const [q, setQ] = useState("");
  const [catId, setCatId] = useState<string>("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newOpen, setNewOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const editing = stocks.find((s) => s.id === editId) ?? null;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("all", stocks.length);
    stocks.forEach((s) => map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1));
    return map;
  }, [stocks]);

  const lowCount = useMemo(() => stocks.filter((s) => s.quantity <= s.lowAt).length, [stocks]);

  const visible = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const filtered = stocks.filter((s) => {
      if (catId !== "all" && s.categoryId !== catId) return false;
      if (lowOnly && s.quantity > s.lowAt) return false;
      if (!ql) return true;
      return s.name.toLowerCase().includes(ql) || s.category.name.toLowerCase().includes(ql);
    });
    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortKey) {
        case "name": av = a.name.toLowerCase(); bv = b.name.toLowerCase(); break;
        case "category": av = a.category.name.toLowerCase(); bv = b.category.name.toLowerCase(); break;
        case "quantity": av = a.quantity; bv = b.quantity; break;
        case "price": av = a.price; bv = b.price; break;
        case "value": av = a.price * a.quantity; bv = b.price * b.quantity; break;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return sorted;
  }, [stocks, q, catId, lowOnly, sortKey, sortDir]);

  const filteredValue = visible.reduce((sum, s) => sum + s.price * s.quantity, 0);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };
  const sortArr = (key: SortKey) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (visible.every((s) => selected.has(s.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map((s) => s.id)));
    }
  };
  const allChecked = visible.length > 0 && visible.every((s) => selected.has(s.id));

  const exportCsv = () => {
    const rows = [
      ["Name", "Category", "SKU", "Quantity", "Unit", "Price", "Value"],
      ...visible.map((s) => [
        s.name,
        s.category.name,
        s.id.slice(-6).toUpperCase(),
        String(s.quantity),
        s.unit,
        s.price.toFixed(2),
        (s.price * s.quantity).toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stocks-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <div className="row between" style={{ alignItems: "flex-end", marginBottom: 18, gap: 24, flexWrap: "wrap" }}>
        <div className="page-title">
          <span className="num">02</span>
          <h1 className="h-1">Stocks</h1>
          <span className="muted mono" style={{ fontSize: 12 }}>
            · {visible.length} of {stocks.length}
          </span>
        </div>
        <div className="row gap-16">
          <div className="col" style={{ alignItems: "flex-end", gap: 4 }}>
            <span className="eyebrow">Filtered value</span>
            <span className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{money(filteredValue)}</span>
          </div>
          <button className="btn btn--ghost" onClick={exportCsv}>
            <i className="fa-solid fa-arrow-up-from-bracket" /> Export CSV
          </button>
          <button className="btn btn--primary" onClick={() => setNewOpen(true)}>
            <i className="fa-solid fa-plus" /> New stock
          </button>
        </div>
      </div>

      <div className="filterbar" style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 14, marginBottom: 14 }}>
        <label className="search">
          <i className="fa-solid fa-magnifying-glass muted" style={{ fontSize: 11 }} aria-hidden />
          <input placeholder="Search by name or category…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button className="chip" data-active={catId === "all" ? 1 : 0} onClick={() => setCatId("all")}>
          All categories <span className="ct">{pad(counts.get("all") ?? 0)}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className="chip"
            data-active={catId === c.id ? 1 : 0}
            onClick={() => setCatId(c.id)}
          >
            {c.name} <span className="ct">{pad(counts.get(c.id) ?? 0)}</span>
          </button>
        ))}
      </div>

      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          {selected.size > 0 && bulkStocks && (
            <div className="row gap-8">
              <span className="mono" style={{ fontSize: 12 }}>
                {pad(selected.size)} selected
              </span>
              <button className="btn btn--accent btn--sm" onClick={() => setBulkOpen(true)}>
                <i className="fa-solid fa-plus" /> Add to movement
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
          )}
        </div>
        <button
          className="chip"
          data-active={lowOnly ? 1 : 0}
          onClick={() => setLowOnly((v) => !v)}
        >
          <i className="fa-solid fa-triangle-exclamation" /> Low stock only <span className="ct">{pad(lowCount)}</span>
        </button>
      </div>

      <div className="panel">
        {visible.length === 0 ? (
          <div className="muted" style={{ padding: 32, textAlign: "center", fontSize: 13 }}>
            {stocks.length === 0 ? "No stocks yet." : "No stocks match your filter."}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" className="chk" checked={allChecked} onChange={toggleAll} aria-label="Select all" />
                </th>
                <th onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>Item{sortArr("name")}</th>
                <th onClick={() => toggleSort("category")} style={{ cursor: "pointer" }}>Category{sortArr("category")}</th>
                <th>SKU</th>
                <th className="right" onClick={() => toggleSort("quantity")} style={{ cursor: "pointer" }}>Qty{sortArr("quantity")}</th>
                <th>Unit</th>
                <th className="right" onClick={() => toggleSort("price")} style={{ cursor: "pointer" }}>Price{sortArr("price")}</th>
                <th className="right" onClick={() => toggleSort("value")} style={{ cursor: "pointer" }}>Value{sortArr("value")}</th>
                <th className="right" style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => {
                const low = s.quantity <= s.lowAt;
                const checked = selected.has(s.id);
                const sku = s.id.slice(-6).toUpperCase();
                return (
                  <tr key={s.id} data-selected={checked ? 1 : 0}>
                    <td>
                      <input
                        type="checkbox"
                        className="chk"
                        checked={checked}
                        onChange={() => toggleRow(s.id)}
                        aria-label={`Select ${s.name}`}
                      />
                    </td>
                    <td>
                      <div className="col" style={{ gap: 4 }}>
                        <span style={{ fontWeight: 500 }}>{s.name}</span>
                        {low && (
                          <span className="pill pill--low" style={{ alignSelf: "flex-start" }}>
                            <i className="fa-solid fa-triangle-exclamation" /> Reorder
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="cat-tag">{s.category.name}</span>
                    </td>
                    <td className="num muted">{sku}</td>
                    <td className="right num">
                      <span style={{ color: low ? "var(--warn)" : undefined }}>{s.quantity}</span>
                    </td>
                    <td className="muted mono" style={{ fontSize: 12 }}>{s.unit}</td>
                    <td className="right num">{money(s.price)}</td>
                    <td className="right num" style={{ fontWeight: 500 }}>{money(s.price * s.quantity)}</td>
                    <td className="right">
                      <div className="row-actions">
                        <button
                          className="btn btn--ghost btn--icon"
                          type="button"
                          onClick={() => setEditId(s.id)}
                          aria-label="Edit"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <form action={deleteStock}>
                          <input type="hidden" name="id" value={s.id} />
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

      <Sheet open={newOpen} onClose={() => setNewOpen(false)} eyebrow="02 · Stocks" title="New stock">
        {newSheet}
      </Sheet>

      <Sheet
        open={!!editing}
        onClose={() => setEditId(null)}
        eyebrow="02 · Stocks"
        title={editing ? `Edit · ${editing.name}` : ""}
      >
        {editing && (
          <StockForm
            action={updateStock.bind(null, editing.id)}
            categories={categories}
            stock={editing}
          />
        )}
      </Sheet>

      {bulkStocks && (
        <Sheet
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          eyebrow="04 · Movements"
          title={`New movement · ${selected.size} item${selected.size === 1 ? "" : "s"}`}
        >
          <MovementForm
            action={createMovement}
            stocks={bulkStocks}
            presetItems={[...selected]}
            presetType="EXPORT"
          />
        </Sheet>
      )}
    </>
  );
}
