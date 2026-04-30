import { SubmitButton } from "@/components/submit-button";

type MovementFormProps = {
  action: (formData: FormData) => Promise<void>;
  stocks: Array<{ id: string; name: string; quantity: number }>;
};

export function MovementForm({ action, stocks }: MovementFormProps) {
  return (
    <form action={action} className="grid max-w-4xl gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Type
          <select
            name="type"
            className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
          >
            <option value="IMPORT">Import</option>
            <option value="EXPORT">Export</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Remark
          <input
            name="remark"
            className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
          />
        </label>
      </div>
      <div className="grid gap-3">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <select
              name="stockId"
              required={row === 0}
              defaultValue=""
              className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
            >
              <option value="" disabled>
                Select stock
              </option>
              {stocks.map((stock) => (
                <option key={stock.id} value={stock.id}>
                  {stock.name} ({stock.quantity} available)
                </option>
              ))}
            </select>
            <input
              name="quantity"
              type="number"
              min="1"
              required={row === 0}
              placeholder="Quantity"
              className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
            />
          </div>
        ))}
      </div>
      <div>
        <SubmitButton>Create movement</SubmitButton>
      </div>
    </form>
  );
}
