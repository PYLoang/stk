"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { Listbox } from "@/components/ui/listbox";
import { stockQty } from "@/lib/format";
import { useClientValidation } from "./use-client-validation";

type TxnFormProps = {
  action: (formData: FormData) => Promise<void>;
  stocks: Array<{ id: string; name: string; quantity: number; price: unknown; unit?: string | null }>;
};

export function TxnForm({ action, stocks }: TxnFormProps) {
  const [mode, setMode] = useState<"stock" | "subject">("stock");
  const [type, setType] = useState<"IMPORT" | "EXPORT">("IMPORT");
  const [stockId, setStockId] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState("");
  const { errors, formProps, fieldProps, error } = useClientValidation();

  const priceOf = (id: string) => {
    const stock = stocks.find((s) => s.id === id);
    return stock ? Number(stock.price).toFixed(2) : "";
  };

  const changeMode = (value: string) => {
    setMode(value as "stock" | "subject");
    setStockId("");
    setSubject("");
    setPrice("");
  };

  const changeStock = (value: string) => {
    setStockId(value);
    setPrice(priceOf(value));
  };

  const stockOptions = stocks.map((s) => ({
    value: s.id,
    label: s.name,
    meta: stockQty(s.quantity, s.unit),
  }));

  return (
    <form {...formProps} action={action} className="col gap-24" style={{ maxWidth: 720 }}>
      <div className="row gap-24">
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Mode <span className="req">*</span></div>
          <Segmented
            name="mode"
            value={mode}
            onChange={changeMode}
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
            onChange={changeStock}
            options={stockOptions}
            placeholder="Select stock"
            required
            searchable
            invalid={Boolean(errors.stockId)}
            describedBy={errors.stockId ? "stockId-error" : undefined}
            validationKey="stockId"
            label="Stock"
          />
          {error("stockId")}
          <div className="field-help">Quantity will adjust this stock on submit.</div>
        </div>
      ) : (
        <div>
          <div className="field-lbl">Subject <span className="req">*</span></div>
          <input
            name="subject"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="e.g. Equipment rental, Utility bill…"
            className="input"
            {...fieldProps("subject", "Subject")}
          />
          {error("subject")}
          <div className="field-help">Free-form transactions don&apos;t touch any stock balance.</div>
        </div>
      )}

      <div className="row gap-24">
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Quantity <span className="req">*</span></div>
          <input
            name="quantity"
            type="number"
            min="1"
            required
            defaultValue="1"
            className="input mono"
            {...fieldProps("quantity", "Quantity")}
          />
          {error("quantity")}
        </div>
        <div style={{ flex: 1 }}>
          <div className="field-lbl">Unit price <span className="req">*</span></div>
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            required
            readOnly={mode === "stock"}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="input mono"
            placeholder="0.00"
            {...fieldProps("price", "Unit price")}
          />
          {error("price")}
        </div>
      </div>

      <div>
        <div className="field-lbl">Remark</div>
        <textarea name="remark" rows={3} className="textarea" {...fieldProps("remark", "Remark")} />
        {error("remark")}
      </div>

      <div className="row gap-8 mt-8">
        <button type="submit" className="btn btn--primary">Create transaction</button>
      </div>
    </form>
  );
}
