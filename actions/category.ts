"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

export async function createCategory(formData: FormData) {
  const data = categorySchema.parse({
    name: formData.get("name"),
  });

  await prisma.category.create({ data });
  revalidatePath("/categories");
  redirect("/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const data = categorySchema.parse({
    name: formData.get("name"),
  });

  await prisma.category.update({ where: { id }, data });
  revalidatePath("/categories");
  redirect("/categories");
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
}
