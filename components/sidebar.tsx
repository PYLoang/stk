import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";

export async function Sidebar() {
  const [stocks, categories, movements, transactions] = await Promise.all([
    prisma.stock.count(),
    prisma.category.count(),
    prisma.movement.count(),
    prisma.txn.count(),
  ]);

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden />
        <span className="col" style={{ gap: 2 }}>
          <span className="brand-name">Marbled</span>
          <span className="brand-sub">Stock System</span>
        </span>
      </Link>

      <SidebarNav counts={{ stocks, categories, movements, transactions }} />

      <SidebarFoot />
    </aside>
  );
}

function SidebarFoot() {
  const now = new Date();
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  return (
    <div className="sidebar-foot">
      <div className="col" style={{ gap: 2 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{date}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{weekday} · open</span>
      </div>
      <ThemeToggle />
    </div>
  );
}
