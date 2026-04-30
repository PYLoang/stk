import { SubmitButton } from "@/components/submit-button";

type CategoryFormProps = {
  action: (formData: FormData) => Promise<void>;
  category?: {
    name: string;
  };
};

export function CategoryForm({ action, category }: CategoryFormProps) {
  return (
    <form action={action} className="grid max-w-xl gap-4">
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Name
        <input
          name="name"
          required
          defaultValue={category?.name}
          className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-500"
        />
      </label>
      <div>
        <SubmitButton>{category ? "Save category" : "Create category"}</SubmitButton>
      </div>
    </form>
  );
}
