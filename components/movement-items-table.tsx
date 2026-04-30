"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/format";

type MovementItem = {
  id: string;
  quantity: number;
  stock: {
    name: string;
    price: number;
    category: { name: string };
  };
};

type SortKey = "stock" | "category" | "quantity" | "price" | "subtotal";
type SortDir = "asc" | "desc";

type Props = {
  items: MovementItem[];
  variant?: "full" | "compact";
};

export function MovementItemsTable({ items, variant = "full" }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("stock");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
      let av: string | number;
      let bv: string | number;

      switch (sortKey) {
        case "stock":
          av = a.stock.name.toLowerCase();
          bv = b.stock.name.toLowerCase();
          break;
        case "category":
          av = a.stock.category.name.toLowerCase();
          bv = b.stock.category.name.toLowerCase();
          break;
        case "quantity":
          av = a.quantity;
          bv = b.quantity;
          break;
        case "price":
          av = a.stock.price;
          bv = b.stock.price;
          break;
        case "subtotal":
          av = a.stock.price * a.quantity;
          bv = b.stock.price * b.quantity;
          break;
      }

      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [items, sortDir, sortKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const sortMark = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <table className="tbl">
      <thead>
        {variant === "compact" ? (
          <tr>
            <th onClick={() => toggleSort("stock")} style={{ cursor: "pointer" }}>
              Item{sortMark("stock")}
            </th>
            <th className="right" onClick={() => toggleSort("quantity")} style={{ cursor: "pointer" }}>
              Qty{sortMark("quantity")}
            </th>
            <th className="right" onClick={() => toggleSort("price")} style={{ cursor: "pointer" }}>
              Unit price{sortMark("price")}
            </th>
            <th className="right" onClick={() => toggleSort("subtotal")} style={{ cursor: "pointer" }}>
              Subtotal{sortMark("subtotal")}
            </th>
          </tr>
        ) : (
          <tr>
            <th onClick={() => toggleSort("stock")} style={{ cursor: "pointer" }}>
              Stock{sortMark("stock")}
            </th>
            <th onClick={() => toggleSort("category")} style={{ cursor: "pointer" }}>
              Category{sortMark("category")}
            </th>
            <th className="right" onClick={() => toggleSort("quantity")} style={{ cursor: "pointer" }}>
              Qty{sortMark("quantity")}
            </th>
            <th className="right" onClick={() => toggleSort("price")} style={{ cursor: "pointer" }}>
              Unit price{sortMark("price")}
            </th>
            <th className="right" onClick={() => toggleSort("subtotal")} style={{ cursor: "pointer" }}>
              Subtotal{sortMark("subtotal")}
            </th>
          </tr>
        )}
      </thead>
      <tbody>
        {sorted.map((item) => (
          <tr key={item.id}>
            <td>
              {variant === "compact" ? (
                <div className="col" style={{ gap: 2 }}>
                  <span style={{ fontWeight: 500 }}>{item.stock.name}</span>
                  <span className="muted mono" style={{ fontSize: 11 }}>
                    {item.stock.category.name}
                  </span>
                </div>
              ) : (
                <span style={{ fontWeight: 500 }}>{item.stock.name}</span>
              )}
            </td>
            {variant === "full" && <td className="muted">{item.stock.category.name}</td>}
            <td className="right num">{item.quantity}</td>
            <td className="right num">{money(item.stock.price)}</td>
            <td className="right num" style={{ fontWeight: 500 }}>
              {money(item.stock.price * item.quantity)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
