import Link from "next/link";
import { createMovement } from "@/actions/movement";
import { MovementForm } from "@/components/forms/movement-form";
import { prisma } from "@/lib/prisma";

export default async function NewMovementPage() {
  const stocks = await prisma.stock.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New Movement</h1>
        <p className="mt-2 text-slate-600">Create one import or export round with one or more stocks.</p>
      </div>
      {stocks.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Create <Link className="underline" href="/stocks/new">stock</Link> before adding a movement.
        </p>
      ) : (
        <MovementForm action={createMovement} stocks={stocks} />
      )}
    </div>
  );
}
