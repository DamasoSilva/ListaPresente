import { db } from "@/db";
import { externalProducts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { ExternalManager } from "./external-manager";

export const dynamic = "force-dynamic";

export default async function AdminIndicacoesPage() {
  const list = await db.query.externalProducts.findMany({
    orderBy: (e, { asc }) => [asc(e.order), asc(e.name)],
  });
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
          Indicações
        </p>
        <h1 className="font-display text-3xl text-[var(--color-navy)] md:text-4xl">
          Produtos externos
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Links externos não entram no sistema de reservas. Servem apenas para
          indicar produtos que o casal gosta.
        </p>
      </div>
      <ExternalManager initial={list} />
    </div>
  );
}
