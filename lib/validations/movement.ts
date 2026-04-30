import { z } from "zod";

export const movementSchema = z.object({
  type: z.enum(["IMPORT", "EXPORT"]),
  remark: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        stockId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1, "At least one stock item is required"),
});
