import { SubmitButton } from "@/components/submit-button";

type TxnFormProps = {
  action: (formData: FormData) => Promise<void>;
  stocks: Array<{ id: string; name: string; quantity: number; price: unknown }>;
};

export function TxnForm({ action, stocks }: TxnFormProps) {
  return (
    <form action={action} className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Mode
        <select
          name="mode"
          defaultValue="stock"
          className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
        >
          <option value="stock">Existing stock</option>
          <option value="subject">Free-form subject</option>
        </select>
      </label>
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
      <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
        Stock
        <select
          name="stockId"
          defaultValue=""
          className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
        >
          <option value="">No stock selected</option>
          {stocks.map((stock) => (
            <option key={stock.id} value={stock.id}>
              {stock.name} ({stock.quantity} available)
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
        Subject
        <input
          name="subject"
          placeholder="Use this when mode is free-form subject"
          className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Quantity
        <input
          name="quantity"
          type="number"
          min="1"
          required
          defaultValue="1"
          className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Price
        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          required
          className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
        Remark
        <textarea
          name="remark"
          rows={3}
          className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-500"
        />
      </label>
      <div className="sm:col-span-2">
        <SubmitButton>Create transaction</SubmitButton>
      </div>
    </form>
  );
}
