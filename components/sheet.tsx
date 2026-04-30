"use client";

import { useEffect } from "react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
};

export function Sheet({ open, onClose, eyebrow, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-h">
          <div className="col" style={{ gap: 6 }}>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 className="h-1" style={{ fontSize: 24 }}>{title}</h2>
          </div>
          <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </aside>
    </>
  );
}
