"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stockQty } from "@/lib/format";
import { movementSchema } from "@/lib/validations/movement";

function parseMovementForm(formData: FormData) {
  const stockIds = formData.getAll("stockId").map(String);
  const quantities = formData.getAll("quantity").map(String);
  const items = stockIds
    .map((stockId, index) => ({
      stockId,
      quantity: quantities[index],
    }))
    .filter((item) => item.stockId && item.quantity);

  return movementSchema.parse({
    type: formData.get("type"),
    remark: formData.get("remark"),
    items,
  });
}

async function nextMovementCode() {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replaceAll("-", "");
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const count = await prisma.movement.count({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return `MV-${ymd}-${String(count + 1).padStart(3, "0")}`;
}

export async function createMovement(formData: FormData) {
  const data = parseMovementForm(formData);
  const code = await nextMovementCode();

  await prisma.$transaction(async (tx) => {
    for (const item of data.items) {
      const stock = await tx.stock.findUniqueOrThrow({
        where: { id: item.stockId },
        select: { quantity: true, name: true, unit: true },
      });

      if (data.type === "EXPORT" && stock.quantity < item.quantity) {
        throw new Error(`${stock.name} only has ${stockQty(stock.quantity, stock.unit)} available.`);
      }
    }

    const movement = await tx.movement.create({
      data: {
        code,
        type: data.type,
        remark: data.remark || null,
        items: {
          create: data.items.map((item) => ({
            stockId: item.stockId,
            quantity: item.quantity,
          })),
        },
      },
    });

    for (const item of data.items) {
      await tx.stock.update({
        where: { id: item.stockId },
        data: {
          quantity: {
            increment: data.type === "IMPORT" ? item.quantity : -item.quantity,
          },
        },
      });
    }

    return movement;
  });

  revalidatePath("/movements");
  revalidatePath("/stocks");
  revalidatePath("/");
  redirect("/movements");
}
