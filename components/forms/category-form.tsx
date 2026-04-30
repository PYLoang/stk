import { SubmitButton } from "@/components/submit-button";

type CategoryFormProps = {
  action: (formData: FormData) => Promise<void>;
  category?: {
    name: string;
  };
};

export function CategoryForm({ action, category }: CategoryFormProps) {
  return (
    <form action={action} className="col gap-24" style={{ maxWidth: 480 }}>
      <div>
        <div className="field-lbl">Name <span className="req">*</span></div>
        <input name="name" required defaultValue={category?.name} className="input" placeholder="e.g. Pastries" />
      </div>
      <div>
        <SubmitButton>{category ? "Save category" : "Create category"}</SubmitButton>
      </div>
    </form>
  );
}
