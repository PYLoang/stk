import { createTxn } from "@/actions/txn";
import { TxnForm } from "@/components/forms/txn-form";
import { TransactionsList } from "@/components/transactions-list";
import { prisma } from "@/lib/prisma";

export default async function TransactionsPage() {
  const [txnsRaw, stocks] = await Promise.all([
    prisma.txn.findMany({
      include: { stock: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stock.findMany({ orderBy: { name: "asc" } }),
  ]);

  const txns = txnsRaw.map((t) => ({
    id: t.id,
    type: t.type,
    quantity: t.quantity,
    price: Number(t.price),
    subject: t.subject,
    stockId: t.stockId,
    stock: t.stock ? { id: t.stock.id, name: t.stock.name } : null,
    createdAt: t.createdAt,
  }));

  return (
    <div className="page">
      <TransactionsList
        txns={txns}
        newSheet={<TxnForm action={createTxn} stocks={stocks} />}
      />
    </div>
  );
}
