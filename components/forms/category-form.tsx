"use client";

import { SubmitButton } from "@/components/submit-button";
import { useClientValidation } from "./use-client-validation";

type CategoryFormProps = {
  action: (formData: FormData) => Promise<void>;
  category?: {
    name: string;
  };
};

export function CategoryForm({ action, category }: CategoryFormProps) {
  const { formProps, fieldProps, error } = useClientValidation();

  return (
    <form {...formProps} action={action} className="col gap-24" style={{ maxWidth: 480 }}>
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
      <div>
        <SubmitButton>{category ? "Save category" : "Create category"}</SubmitButton>
      </div>
    </form>
  );
}
