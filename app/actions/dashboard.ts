"use server";

import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, type MovementRow, type TxnRow } from "./dashboard-types";

export async function fetchMoreMovements(cursor?: string): Promise<{
  rows: MovementRow[];
  nextCursor: string | null;
}> {
  const records = await prisma.movement.findMany({
    include: { items: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = records.length > PAGE_SIZE;
  const page = hasMore ? records.slice(0, PAGE_SIZE) : records;
  return {
    rows: page.map((m) => ({
      id: m.id,
      code: m.code,
      type: m.type,
      remark: m.remark,
      createdAt: m.createdAt,
      itemCount: m.items.length,
    })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export async function fetchMoreTxns(cursor?: string): Promise<{
  rows: TxnRow[];
  nextCursor: string | null;
}> {
  const records = await prisma.txn.findMany({
    include: { stock: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = records.length > PAGE_SIZE;
  const page = hasMore ? records.slice(0, PAGE_SIZE) : records;
  return {
    rows: page.map((t) => ({
      id: t.id,
      type: t.type,
      quantity: t.quantity,
      price: t.price,
      subject: t.subject,
      createdAt: t.createdAt,
      stock: t.stock ? { id: t.stock.id, name: t.stock.name } : null,
    })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}
