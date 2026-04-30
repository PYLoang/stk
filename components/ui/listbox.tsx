"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type ListboxOption = {
  value: string;
  label: string;
  meta?: string; // mono caption shown on the right (e.g. "(18 available)")
  hint?: string; // small muted line under the label
  disabled?: boolean;
};

type Props = {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: ListboxOption[];
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  emptyText?: string;
  invalid?: boolean;
  describedBy?: string;
  validationKey?: string;
  label?: string;
};

export function Listbox({
  name,
  value,
  onChange,
  options,
  placeholder = "Select…",
  required,
  searchable = true,
  emptyText = "No matches.",
  invalid,
  describedBy,
  validationKey,
  label,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const validationRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Imperatively keep validation input in sync so we can use native required without React controlled warnings
  useEffect(() => {
    if (validationRef.current && validationRef.current.value !== value) {
      validationRef.current.value = value;
      validationRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, [value]);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) =>
      o.label.toLowerCase().includes(q) || (o.meta ?? "").toLowerCase().includes(q),
    );
  }, [options, query, searchable]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  const openList = () => {
    const idx = filtered.findIndex((o) => o.value === value);
    setActiveIdx(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIdx];
      if (opt && !opt.disabled) commit(opt.value);
    }
  };

  return (
    <div className="lb" ref={rootRef} onKeyDown={onKeyDown}>
      <input
        ref={validationRef}
        className="lb-validation"
        name={name}
        defaultValue={value}
        required={required}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        data-field-key={validationKey}
        data-label={label}
        onChange={() => { /* updated imperatively */ }}
        onFocus={openList}
        tabIndex={-1}
        aria-hidden
      />
      <button
        type="button"
        className="lb-trigger"
        data-invalid={invalid ? 1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        <span className="lb-value">
          {selected ? (
            <>
              <span>{selected.label}</span>
              {selected.meta && <span className="lb-meta">{selected.meta}</span>}
            </>
          ) : (
            <span className="lb-placeholder">{placeholder}</span>
          )}
        </span>
        <span className="lb-chev" aria-hidden>▾</span>
      </button>

      {open && (
        <div className="lb-panel" role="listbox" id={listId} tabIndex={-1}>
          {searchable && (
            <div className="lb-search">
              <i className="fa-solid fa-magnifying-glass muted" style={{ fontSize: 11 }} aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                placeholder="Search…"
                aria-label="Search options"
              />
            </div>
          )}
          <div className="lb-list">
            {filtered.length === 0 ? (
              <div className="lb-empty">{emptyText}</div>
            ) : (
              filtered.map((opt, i) => {
                const isSel = opt.value === value;
                const isAct = i === activeIdx;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    disabled={opt.disabled}
                    className="lb-opt"
                    data-selected={isSel ? 1 : 0}
                    data-active={isAct ? 1 : 0}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => !opt.disabled && commit(opt.value)}
                  >
                    <span className="lb-opt-main">
                      <span className="lb-opt-label">{opt.label}</span>
                      {opt.hint && <span className="lb-opt-hint">{opt.hint}</span>}
                    </span>
                    {opt.meta && <span className="lb-opt-meta">{opt.meta}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
