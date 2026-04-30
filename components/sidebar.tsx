import Link from "next/link";
import { fmtDateTime } from "@/lib/format";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden />
        <span className="col" style={{ gap: 2 }}>
          <span className="brand-name">STK</span>
          <span className="brand-sub">Stock System</span>
        </span>
      </Link>

      <SidebarNav />

      <SidebarFoot />
    </aside>
  );
}

function SidebarFoot() {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  return (
    <div className="sidebar-foot">
      <div className="col" style={{ gap: 2 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{fmtDateTime(now)}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{weekday} · open</span>
      </div>
      <ThemeToggle />
    </div>
  );
}
