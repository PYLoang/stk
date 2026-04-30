import { z } from "zod";
import { hasMaxFractionDigits } from "@/lib/format";

export const txnSchema = z
  .object({
    stockId: z.string().optional(),
    subject: z.string().trim().optional(),
    type: z.enum(["IMPORT", "EXPORT"]),
    quantity: z.coerce.number().int().positive(),
    price: z.coerce
      .number()
      .positive()
      .refine((value) => hasMaxFractionDigits(value, 2), "Unit price must have at most 2 decimal places"),
    remark: z.string().trim().optional(),
  })
  .refine((data) => Boolean(data.stockId) !== Boolean(data.subject), {
    message: "Provide either stock or subject, not both",
    path: ["stockId"],
  });
