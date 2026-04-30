"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items: { href: string; icon: string; label: string }[] = [
  { href: "/", icon: "fa-solid fa-gauge-high", label: "Dashboard" },
  { href: "/stocks", icon: "fa-solid fa-boxes-stacked", label: "Stocks" },
  { href: "/categories", icon: "fa-solid fa-tags", label: "Categories" },
  { href: "/movements", icon: "fa-solid fa-arrow-right-arrow-left", label: "Movements" },
  { href: "/transactions", icon: "fa-solid fa-receipt", label: "Transactions" },
];

export function SidebarNav() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");

  return (
    <nav className="nav-group" style={{ flex: 1 }}>
      <div className="nav-group-h">Workspace</div>
      {items.map((it) => {
        const active = isActive(it.href);
        return (
          <Link key={it.href} href={it.href} className="nav-item" data-active={active ? 1 : 0}>
            <i className={`nav-icon ${it.icon}`} aria-hidden />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
