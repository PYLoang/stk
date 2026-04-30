"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { Listbox } from "@/components/ui/listbox";
import { stockQty } from "@/lib/format";
import { useClientValidation } from "./use-client-validation";

type Stock = { id: string; name: string; quantity: number; unit?: string };

type Props = {
  action: (formData: FormData) => Promise<void>;
  stocks: Stock[];
  presetItems?: string[];
  presetType?: "IMPORT" | "EXPORT";
};

export function MovementForm({ action, stocks, presetItems, presetType }: Props) {
  const initial = presetItems && presetItems.length > 0 ? [...presetItems] : [""];

  const [type, setType] = useState<"IMPORT" | "EXPORT">(presetType ?? "IMPORT");
  const [rows, setRows] = useState<string[]>(initial);
  const { errors, formProps, fieldProps, error } = useClientValidation();

  const setRow = (i: number, v: string) => {
    setRows((prev) => prev.map((x, j) => (j === i ? v : x)));
  };
  const addRow = () => setRows((prev) => [...prev, ""]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, j) => j !== i));

  const stockOptions = stocks.map((s) => ({
    value: s.id,
    label: s.name,
    meta: stockQty(s.quantity, s.unit),
  }));

  const usedIds = new Set(rows.filter(Boolean));

  return (
    <form {...formProps} action={action} className="col gap-24" style={{ maxWidth: 880 }}>
      <div>
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

      <div>
        <div className="row between mb-8">
          <div className="field-lbl" style={{ marginBottom: 0 }}>Items</div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addRow}>
            <i className="fa-solid fa-plus" /> Add row
          </button>
        </div>
        <div className="col" style={{ gap: 14 }}>
          {rows.map((stockId, row) => {
            const options = stockOptions.map((o) => ({
              ...o,
              disabled: o.value !== stockId && usedIds.has(o.value),
              hint: o.value !== stockId && usedIds.has(o.value) ? "Already added" : undefined,
            }));
            return (
              <div key={row} className="row gap-16" style={{ alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Listbox
                    name="stockId"
                    value={stockId}
                    onChange={(v) => setRow(row, v)}
                    options={options}
                    placeholder="Select stock"
                    required={row === 0 && !rows.some(Boolean)}
                    invalid={Boolean(errors[`stockId-${row}`])}
                    describedBy={errors[`stockId-${row}`] ? `stockId-${row}-error` : undefined}
                    validationKey={`stockId-${row}`}
                    label="Stock"
                  />
                  {error(`stockId-${row}`)}
                </div>
                <div style={{ width: 112 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      step="1"
                      defaultValue={stockId ? 1 : ""}
                      placeholder="Qty"
                      className="input mono"
                      required={!!stockId}
                      {...fieldProps(`quantity-${row}`, "Quantity")}
                    />
                    {error(`quantity-${row}`)}
                  </div>
                </div>
                {rows.length > 1 && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--icon"
                    onClick={() => removeRow(row)}
                    aria-label="Remove row"
                    title="Remove"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="field-lbl">Remark</div>
        <textarea name="remark" rows={3} className="textarea" placeholder="Optional notes" {...fieldProps("remark", "Remark")} />
        {error("remark")}
      </div>

      <div className="row gap-8 mt-8">
        <button type="submit" className="btn btn--primary">Create movement</button>
      </div>
    </form>
  );
}
