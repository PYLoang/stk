"use client";

import { useMemo, useState } from "react";
import { Sheet } from "./sheet";
import { CategoryForm } from "./forms/category-form";
import { deleteCategory, updateCategory } from "@/actions/category";

type Category = {
  id: string;
  name: string;
  stockCount: number;
};

type SortKey = "name" | "stockCount";

type Props = {
  categories: Category[];
  newSheet: React.ReactNode;
};

export function CategoriesList({ categories, newSheet }: Props) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [newOpen, setNewOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const editing = categories.find((c) => c.id === editId) ?? null;

  const visible = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const filtered = categories.filter((c) => !ql || c.name.toLowerCase().includes(ql));
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = sortKey === "name" ? a.name.toLowerCase() : a.stockCount;
      const bv = sortKey === "name" ? b.name.toLowerCase() : b.stockCount;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [categories, q, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };
  const sortArr = (k: SortKey) => sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <>
      <div className="row between" style={{ alignItems: "flex-end", marginBottom: 18, gap: 24, flexWrap: "wrap" }}>
        <div className="page-title">
          <span className="num">03</span>
          <h1 className="h-1">Categories</h1>
          <span className="muted mono" style={{ fontSize: 12 }}>
            · {visible.length} of {categories.length}
          </span>
        </div>
        <button className="btn btn--primary" onClick={() => setNewOpen(true)}>
          <i className="fa-solid fa-plus" /> New category
        </button>
      </div>

      <div className="filterbar" style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 14, marginBottom: 14 }}>
        <label className="search">
          <i className="fa-solid fa-magnifying-glass muted" style={{ fontSize: 11 }} aria-hidden />
          <input placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      <div className="panel">
        {visible.length === 0 ? (
          <div className="muted" style={{ padding: 32, textAlign: "center", fontSize: 13 }}>
            {categories.length === 0 ? "No categories yet." : "No categories match your filter."}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>Name{sortArr("name")}</th>
                <th className="right" onClick={() => toggleSort("stockCount")} style={{ cursor: "pointer" }}>Stocks{sortArr("stockCount")}</th>
                <th className="right" style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td className="right num">{c.stockCount}</td>
                  <td className="right">
                    <div className="row-actions">
                      <button
                        className="btn btn--ghost btn--icon"
                        type="button"
                        onClick={() => setEditId(c.id)}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={c.id} />
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Sheet open={newOpen} onClose={() => setNewOpen(false)} eyebrow="03 · Categories" title="New category">
        {newSheet}
      </Sheet>

      <Sheet
        open={!!editing}
        onClose={() => setEditId(null)}
        eyebrow="03 · Categories"
        title={editing ? `Edit · ${editing.name}` : ""}
      >
        {editing && (
          <CategoryForm action={updateCategory.bind(null, editing.id)} category={editing} />
        )}
      </Sheet>
    </>
  );
}
