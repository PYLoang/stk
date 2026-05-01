"use client";

import { useClientValidation } from "./use-client-validation";
import { FormActions } from "./form-actions";

type CategoryFormProps = {
  action: (formData: FormData) => Promise<void>;
  category?: {
    name: string;
  };
};

export function CategoryForm({ action, category }: CategoryFormProps) {
  const { formProps, fieldProps, error } = useClientValidation();

  return (
    <form {...formProps} action={action} className="col gap-24">
      <div>
        <div className="field-lbl">Name <span className="req">*</span></div>
        <input
          name="name"
          required
          defaultValue={category?.name}
          className="input"
          placeholder="e.g. Pastries"
          {...fieldProps("name", "Name")}
        />
        {error("name")}
      </div>
      <FormActions submitLabel={category ? "Save category" : "Create category"} />
    </form>
  );
}
