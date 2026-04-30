"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { Listbox } from "@/components/ui/listbox";

type TxnFormProps = {
  action: (formData: FormData) => Promise<void>;
  stocks: Array<{ id: string; name: string; quantity: number; price: unknown }>;
};

export function TxnForm({ action, stocks }: TxnFormProps) {
  const [mode, setMode] = useState<"stock" | "subject">("stock");
  const [type, setType] = useState<"IMPORT" | "EXPORT">("IMPORT");
  const [stockId, setStockId] = useState("");

  const stockOptions = stocks.map((s) => ({
    value: s.id,
    label: s.name,
    meta: `${s.quantity} avail`,
  }));

  return (
    <form action={action} className="col gap-24" style={{ maxWidth: 720 }}>
      <div className="row gap-24">
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Mode <span className="req">*</span></div>
          <Segmented
            name="mode"
            value={mode}
            onChange={(v) => setMode(v as "stock" | "subject")}
            options={[
              { value: "stock", label: "Existing stock" },
              { value: "subject", label: "Free-form subject" },
            ]}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Type <span className="req">*</span></div>
          <Segmented
            name="type"
            value={type}
            onChange={(v) => setType(v as "IMPORT" | "EXPORT")}
            options={[
              { value: "IMPORT", label: "Import" },
              { value: "EXPORT", label: "Export" },
            ]}
          />
        </div>
      </div>

      {mode === "stock" ? (
        <div>
          <div className="field-lbl">Stock <span className="req">*</span></div>
          <Listbox
            name="stockId"
            value={stockId}
            onChange={setStockId}
            options={stockOptions}
            placeholder="Select stock"
            required
            searchable
          />
          <div className="field-help">Quantity will adjust this stock on submit.</div>
        </div>
      ) : (
        <div>
          <div className="field-lbl">Subject <span className="req">*</span></div>
          <input
            name="subject"
            required
            placeholder="e.g. Equipment rental, Utility bill…"
            className="input"
          />
          <div className="field-help">Free-form transactions don't touch any stock balance.</div>
        </div>
      )}

      <div className="row gap-24">
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Quantity <span className="req">*</span></div>
          <input name="quantity" type="number" min="1" required defaultValue="1" className="input mono" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Unit price <span className="req">*</span></div>
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="input mono"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <div className="field-lbl">Remark</div>
        <textarea name="remark" rows={3} className="textarea" />
      </div>

      <div className="row gap-8 mt-8">
        <button type="submit" className="btn btn--primary">Create transaction</button>
      </div>
    </form>
  );
}
