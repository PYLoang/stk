import { z } from "zod";

export const stockSchema = z.object({
  name: z.string().trim().min(1, "Stock name is required"),
  quantity: z.coerce.number().int().min(0),
  price: z.coerce.number().positive(),
  categoryId: z.string().min(1, "Category is required"),
});
