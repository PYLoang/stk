import { SubmitButton } from "@/components/submit-button";

type StockFormProps = {
  action: (formData: FormData) => Promise<void>;
  categories: Array<{ id: string; name: string }>;
  stock?: {
    name: string;
    quantity: number;
    price: unknown;
    categoryId: string;
  };
};

export function StockForm({ action, categories, stock }: StockFormProps) {
  return (
    <form action={action} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
        Name
        <input
          name="name"
          required
          defaultValue={stock?.name}
          className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Quantity
        <input
          name="quantity"
          type="number"
          min="0"
          required
          defaultValue={stock?.quantity ?? 0}
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
          defaultValue={stock?.price ? String(stock.price) : ""}
          className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
        Category
        <select
          name="categoryId"
          required
          defaultValue={stock?.categoryId ?? ""}
          className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
        >
          <option value="" disabled>
            Select category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className="sm:col-span-2">
        <SubmitButton>{stock ? "Save stock" : "Create stock"}</SubmitButton>
      </div>
    </form>
  );
}
