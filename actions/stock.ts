"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stockSchema } from "@/lib/validations/stock";

function stockDataFromForm(formData: FormData) {
  const parsed = stockSchema.parse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
  });

  return {
    ...parsed,
    price: parsed.price,
  };
}

export async function createStock(formData: FormData) {
  await prisma.stock.create({ data: stockDataFromForm(formData) });
  revalidatePath("/stocks");
  revalidatePath("/");
  redirect("/stocks");
}

export async function updateStock(id: string, formData: FormData) {
  await prisma.stock.update({
    where: { id },
    data: stockDataFromForm(formData),
  });
  revalidatePath("/stocks");
  revalidatePath("/");
  redirect("/stocks");
}

export async function deleteStock(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.stock.delete({ where: { id } });
  revalidatePath("/stocks");
  revalidatePath("/");
}
