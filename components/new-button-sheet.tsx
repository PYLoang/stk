"use client";

import { useState } from "react";
import { Sheet } from "./sheet";

type Props = {
  label: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

export function NewButtonSheet({ label, eyebrow, title, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn--primary" onClick={() => setOpen(true)}>
        {label}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} eyebrow={eyebrow} title={title}>
        {children}
      </Sheet>
    </>
  );
}
