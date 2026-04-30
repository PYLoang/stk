import Link from "next/link";
import { createTxn } from "@/actions/txn";
import { TxnForm } from "@/components/forms/txn-form";
import { prisma } from "@/lib/prisma";

export default async function NewTransactionPage() {
  const stocks = await prisma.stock.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">05 · NEW</span>
          <h1 className="h-1">New transaction</h1>
        </div>
        <Link href="/transactions" className="btn btn--ghost">Cancel</Link>
      </div>
      <TxnForm action={createTxn} stocks={stocks} />
    </div>
  );
}
