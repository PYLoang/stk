"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { fetchMoreMovements } from "@/app/actions/dashboard";
import { type MovementRow } from "@/app/actions/dashboard-types";
import { fmtDateTime } from "@/lib/format";

type Props = {
  initial: MovementRow[];
  initialCursor: string | null;
};

export function DashboardMovementsList({ initial, initialCursor }: Props) {
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
            const next = await fetchMoreMovements(cursor);
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
        No movements yet.
      </div>
    );
  }

  return (
    <div style={{ maxHeight: 8 * 44 + 37, overflowY: "auto" }}>
      <table className="tbl">
        <thead style={{ position: "sticky", top: 0, background: "var(--bg)", zIndex: 1 }}>
          <tr>
            <th style={{ width: 30 }}></th>
            <th>Code</th>
            <th>Remark</th>
            <th className="right">Items</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <td>
                <i
                  className={
                    m.type === "IMPORT"
                      ? "fa-solid fa-arrow-right-to-bracket"
                      : "fa-solid fa-arrow-right-from-bracket"
                  }
                  style={{
                    fontSize: 13,
                    color: m.type === "IMPORT" ? "var(--pos)" : "var(--neg)",
                  }}
                  aria-hidden
                />
              </td>
              <td className="num">{m.code}</td>
              <td
                className="nowrap"
                style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {m.remark || <span className="faint">—</span>}
              </td>
              <td className="right num">{m.itemCount}</td>
              <td className="num muted nowrap">{fmtDateTime(m.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
