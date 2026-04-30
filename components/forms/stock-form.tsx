"use client";

import { useState } from "react";
import { Listbox } from "@/components/ui/listbox";

type StockFormProps = {
  action: (formData: FormData) => Promise<void>;
  categories: Array<{ id: string; name: string }>;
  stock?: {
    name: string;
    quantity: number;
    price: unknown;
    unit?: string;
    lowAt?: number;
    categoryId: string;
  };
};

export function StockForm({ action, categories, stock }: StockFormProps) {
  const [categoryId, setCategoryId] = useState(stock?.categoryId ?? "");

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form action={action} className="col gap-24" style={{ maxWidth: 640 }}>
      <div>
        <div className="field-lbl">Name <span className="req">*</span></div>
        <input name="name" required defaultValue={stock?.name} className="input" placeholder="e.g. Vanilla flour" />
      </div>

      <div className="row gap-24" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Quantity</div>
          <input
            name="quantity"
            type="number"
            min="0"
            required
            defaultValue={stock?.quantity ?? 0}
            className="input mono"
          />
        </div>
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Unit <span className="req">*</span></div>
          <input
            name="unit"
            required
            defaultValue={stock?.unit ?? "pc"}
            className="input mono"
            placeholder="pc, kg, tray…"
          />
        </div>
      </div>

      <div className="row gap-24" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Unit price <span className="req">*</span></div>
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={stock?.price ? String(stock.price) : ""}
            className="input mono"
            placeholder="0.00"
          />
        </div>
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Reorder at</div>
          <input
            name="lowAt"
            type="number"
            min="0"
            defaultValue={stock?.lowAt ?? ""}
            placeholder="0"
            className="input mono"
          />
          <div className="field-help">Show low-stock warning when qty ≤ this number. Leave blank for 0.</div>
        </div>
      </div>

      <div>
        <div className="field-lbl">Category <span className="req">*</span></div>
        <Listbox
          name="categoryId"
          value={categoryId}
          onChange={setCategoryId}
          options={categoryOptions}
          placeholder="Select category"
          required
        />
      </div>

      <div className="row gap-8 mt-8">
        <button type="submit" className="btn btn--primary">{stock ? "Save stock" : "Create stock"}</button>
      </div>
    </form>
  );
}
