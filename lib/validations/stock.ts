import { z } from "zod";
import { hasMaxFractionDigits } from "@/lib/format";

export const stockSchema = z.object({
  name: z.string().trim().min(1, "Stock name is required"),
  quantity: z.coerce.number().int().min(0),
  price: z.coerce
    .number()
    .positive()
    .refine((value) => hasMaxFractionDigits(value, 2), "Unit price must have at most 2 decimal places"),
  unit: z.string().trim().min(1).default("pc"),
  lowAt: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : v),
    z.coerce.number().int().min(0),
  ),
  categoryId: z.string().min(1, "Category is required"),
});
