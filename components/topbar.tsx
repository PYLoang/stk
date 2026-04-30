"use client";

import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  "": "Dashboard",
  stocks: "Stocks",
  categories: "Categories",
  movements: "Movements",
  transactions: "Transactions",
};

export function Topbar() {
  const path = usePathname();
  const segs = path.split("/").filter(Boolean);
  const root = segs[0] ?? "";
  const current = labels[root] ?? "Page";

  return (
    <div className="topbar">
      <div className="crumbs">
        <span>Inventory</span>
        <span className="sep">/</span>
        <span className="now">{current}</span>
        {segs.slice(1).map((s, i) => (
          <span key={i} style={{ display: "contents" }}>
            <span className="sep">/</span>
            <span className="mono" style={{ fontSize: 11 }}>{s}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
