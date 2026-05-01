"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { fetchMoreTxns } from "@/app/actions/dashboard";
import { type TxnRow } from "@/app/actions/dashboard-types";
import { money } from "@/lib/format";

type Props = {
  initial: TxnRow[];
  initialCursor: string | null;
};

export function DashboardTxnsList({ initial, initialCursor }: Props) {
  const [rows, setRows] = useState(initial);
  const [cursor, setCursor] = useState(initialCursor);
  const [pending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cursor || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !pending) {
          startTransition(async () => {
            const next = await fetchMoreTxns(cursor);
            setRows((prev) => [...prev, ...next.rows]);
            setCursor(next.nextCursor);
          });
        }
      },
      { root: el.parentElement, rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cursor, pending]);

  if (rows.length === 0) {
    return (
      <div className="muted" style={{ padding: 32, textAlign: "center", fontSize: 13 }}>
        No transactions yet.
      </div>
    );
  }

  return (
    <div style={{ maxHeight: 8 * 50, overflowY: "auto" }}>
      {rows.map((t) => {
        const ttl = t.stock ? t.stock.name : t.subject;
        return (
          <div
            key={t.id}
            className="row between"
            style={{ padding: "12px 18px", borderBottom: "1px solid var(--rule-2)" }}
          >
            <div className="row gap-8" style={{ flex: 1, minWidth: 0 }}>
              <span className={t.type === "IMPORT" ? "pill pill--in" : "pill pill--out"}>
                {t.type === "IMPORT" ? "IN" : "OUT"}
              </span>
              <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ttl}
                </span>
                <span className="muted" style={{ fontSize: 11 }}>
                  {t.stock ? "Stock" : "Subject"}
                </span>
              </div>
            </div>
            <div className="col" style={{ alignItems: "flex-end", gap: 2 }}>
              <span className="mono tnum" style={{ fontWeight: 500 }}>
                {money(t.quantity * t.price)}
              </span>
              <span className="muted mono" style={{ fontSize: 11 }}>
                {t.quantity} × {money(t.price)}
              </span>
            </div>
          </div>
        );
      })}
      {cursor && (
        <div
          ref={sentinelRef}
          className="muted"
          style={{ padding: 12, textAlign: "center", fontSize: 11 }}
        >
          {pending ? "Loading…" : ""}
        </div>
      )}
    </div>
  );
}
