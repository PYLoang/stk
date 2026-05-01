"use client";

import { useState } from "react";
import { money } from "@/lib/format";

type Datum = { day: number; month: number; in: number; out: number };

type Props = {
  data: Datum[];
  w?: number;
  h?: number;
};

type Hover = { i: number; kind: "in" | "out"; xPct: number; yPct: number };

export function BarChart({ data, w = 960, h = 260 }: Props) {
  const [hover, setHover] = useState<Hover | null>(null);

  const max = Math.max(1, ...data.map((d) => Math.max(d.in || 0, d.out || 0)));
  const padL = 44;
  const padR = 8;
  const padT = 8;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const groupW = innerW / data.length;
  const gap = Math.max(1, groupW * 0.12);
  const barW = (groupW - gap * 3) / 2;
  const yOf = (v: number) => padT + innerH - (v / max) * innerH;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    v: Math.round(t * max),
    y: padT + innerH - t * innerH,
  }));

  const labelStep = data.length <= 10 ? 1 : 5;
  const lastDay = data[data.length - 1].day;
  const firstDay = data[0].day;
  const labelDays = data
    .map((d) => d.day)
    .filter((d) => d === firstDay || d === lastDay || d % labelStep === 0);

  const fmtTick = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v >= 10_000_000 ? 1 : 2)}m`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1)}k`;
    return `$${v}`;
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <svg
        className="bar-chart"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={t.y}
              x2={w - padR}
              y2={t.y}
              stroke="var(--rule-2)"
              strokeWidth="0.5"
            />
            <text
              x={padL - 6}
              y={t.y + 3}
              textAnchor="end"
              fontFamily="var(--mono)"
              fontSize="8.5"
              fill="var(--ink-4)"
            >
              {fmtTick(t.v)}
            </text>
          </g>
        ))}
        <line
          x1={padL}
          y1={padT + innerH}
          x2={w - padR}
          y2={padT + innerH}
          stroke="var(--rule)"
          strokeWidth="0.5"
        />
        {data.map((d, i) => {
          const x0 = padL + i * groupW + gap;
          const inX = x0;
          const outX = x0 + barW + gap;
          const inH = ((d.in || 0) / max) * innerH;
          const outH = ((d.out || 0) / max) * innerH;
          const inY = yOf(d.in || 0);
          const outY = yOf(d.out || 0);

          const onEnter = (kind: "in" | "out", barX: number, barY: number) => {
            setHover({
              i,
              kind,
              xPct: ((barX + barW / 2) / w) * 100,
              yPct: (barY / h) * 100,
            });
          };

          return (
            <g key={i}>
              <rect
                className="bar-in"
                x={inX}
                y={inY}
                width={barW}
                height={inH}
                onMouseEnter={() => onEnter("in", inX, inY)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              />
              <rect
                className="bar-out"
                x={outX}
                y={outY}
                width={barW}
                height={outH}
                onMouseEnter={() => onEnter("out", outX, outY)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              />
            </g>
          );
        })}
        {data.map((d, i) => {
          if (!labelDays.includes(d.day)) return null;
          const x = padL + i * groupW + groupW / 2;
          return (
            <text
              key={i}
              x={x}
              y={h - 6}
              textAnchor="middle"
              fontFamily="var(--mono)"
              fontSize="9"
              fill="var(--ink-4)"
            >
              {String(d.day).padStart(2, "0")}/{String(d.month).padStart(2, "0")}
            </text>
          );
        })}
      </svg>
      {hover && (
        <div
          style={{
            position: "absolute",
            left: `${hover.xPct}%`,
            top: `${hover.yPct}%`,
            transform: "translate(-50%, calc(-100% - 8px))",
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "6px 10px",
            borderRadius: 4,
            fontSize: 11,
            fontFamily: "var(--mono)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 12px oklch(0 0 0 / 0.18)",
            zIndex: 2,
          }}
        >
          <div style={{ opacity: 0.65, fontSize: 10, marginBottom: 2 }}>
            {String(data[hover.i].day).padStart(2, "0")}/
            {String(data[hover.i].month).padStart(2, "0")} ·{" "}
            {hover.kind === "in" ? "Income" : "Expenses"}
          </div>
          <div style={{ fontWeight: 500 }}>
            {money(hover.kind === "in" ? data[hover.i].in : data[hover.i].out)}
          </div>
        </div>
      )}
    </div>
  );
}
