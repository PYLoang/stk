"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { txnSchema } from "@/lib/validations/txn";

function parseTxnForm(formData: FormData) {
  const mode = String(formData.get("mode") ?? "stock");
  const parsed = txnSchema.parse({
    stockId: mode === "stock" ? formData.get("stockId") || undefined : undefined,
    subject: mode === "subject" ? formData.get("subject") || undefined : undefined,
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    price: formData.get("price"),
    remark: formData.get("remark"),
  });

  return {
    ...parsed,
    price: parsed.price,
    subject: parsed.subject || null,
    stockId: parsed.stockId || null,
    remark: parsed.remark || null,
  };
}

export async function createTxn(formData: FormData) {
  const data = parseTxnForm(formData);

  await prisma.$transaction(async (tx) => {
    if (data.stockId) {
      const stock = await tx.stock.findUniqueOrThrow({
        where: { id: data.stockId },
        select: { quantity: true, name: true },
      });

      if (data.type === "EXPORT" && stock.quantity < data.quantity) {
        throw new Error(`${stock.name} only has ${stock.quantity} available.`);
      }

      await tx.stock.update({
        where: { id: data.stockId },
        data: {
          quantity: {
            increment: data.type === "IMPORT" ? data.quantity : -data.quantity,
          },
        },
      });
    }

    await tx.txn.create({ data });
  });

  revalidatePath("/transactions");
  revalidatePath("/stocks");
  revalidatePath("/");
  redirect("/transactions");
}

export async function deleteTxn(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.txn.delete({ where: { id } });
  revalidatePath("/transactions");
}
