"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Counts = { stocks: number; categories: number; movements: number; transactions: number };

const items: { href: string; num: string; label: string; key: keyof Counts }[] = [
  { href: "/", num: "01", label: "Dashboard", key: "stocks" },
  { href: "/stocks", num: "02", label: "Stocks", key: "stocks" },
  { href: "/categories", num: "03", label: "Categories", key: "categories" },
  { href: "/movements", num: "04", label: "Movements", key: "movements" },
  { href: "/transactions", num: "05", label: "Transactions", key: "transactions" },
];

export function SidebarNav({ counts }: { counts: Counts }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

  return (
    <nav className="nav-group" style={{ flex: 1 }}>
      <div className="nav-group-h">Workspace</div>
      {items.map((it) => {
        const active = isActive(it.href);
        const showCount = it.href !== "/";
        return (
          <Link key={it.href} href={it.href} className="nav-item" data-active={active ? 1 : 0}>
            <span className="nav-num">{it.num}</span>
            <span>{it.label}</span>
            {showCount && <span className="nav-cnt">{String(counts[it.key]).padStart(2, "0")}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
