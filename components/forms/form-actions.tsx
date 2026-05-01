"use client";

import { useRouter } from "next/navigation";
import { useSheetClose } from "@/components/sheet";

type Props = {
  submitLabel: string;
  submitVariant?: "primary" | "accent";
};

export function FormActions({ submitLabel, submitVariant = "primary" }: Props) {
  const sheetClose = useSheetClose();
  const router = useRouter();

  const onCancel = () => {
    if (sheetClose) sheetClose();
    else router.back();
  };

  return (
    <div
      className="row"
      style={{
        gap: 8,
        justifyContent: "flex-end",
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid var(--rule)",
      }}
    >
      <button type="button" className="btn btn--ghost" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" className={`btn btn--${submitVariant}`}>
        {submitLabel}
      </button>
    </div>
  );
}
