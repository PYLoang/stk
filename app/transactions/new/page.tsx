import { createTxn } from "@/actions/txn";
import { TxnForm } from "@/components/forms/txn-form";
import { prisma } from "@/lib/prisma";

export default async function NewTransactionPage() {
  const stocks = await prisma.stock.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New Transaction</h1>
        <p className="mt-2 text-slate-600">Log a stock or non-stock transaction line.</p>
      </div>
      <TxnForm action={createTxn} stocks={stocks} />
    </div>
  );
}
