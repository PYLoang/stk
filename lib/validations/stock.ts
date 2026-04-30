import { z } from "zod";

export const stockSchema = z.object({
  name: z.string().trim().min(1, "Stock name is required"),
  quantity: z.coerce.number().int().min(0),
  price: z.coerce.number().positive(),
  unit: z.string().trim().min(1).default("pc"),
  lowAt: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : v),
    z.coerce.number().int().min(0),
  ),
  categoryId: z.string().min(1, "Category is required"),
});
