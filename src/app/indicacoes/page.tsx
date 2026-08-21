import { db } from "@/db";
import { externalProducts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSiteConfig } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ExternalProductCard } from "@/components/ExternalProductCard";
import Link from "next/link";
import { Button } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Indicações · Casa Nova",
  description: "Produtos que gostamos em lojas externas.",
};

export default async function IndicacoesPage() {
  const config = await getSiteConfig();
  const list = await db.query.externalProducts.findMany({
    where: and(eq(externalProducts.active, true)),
    orderBy: (e, { asc }) => [asc(e.order), asc(e.name)],
  });

  return (
    <div className="min-h-screen">
      <Header config={config} />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
            Indicações
          </p>
          <h1 className="mt-3 font-display text-4xl text-[var(--color-navy)] md:text-5xl">
            Produtos que amamos em lojas externas
          </h1>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            Esses links abrem em nova aba. Eles não entram no sistema de
            reservas do site.
          </p>
        </div>
        {list.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white p-12 text-center card-shadow">
            <p className="text-4xl">🛍️</p>
            <p className="mt-3 font-display text-xl text-[var(--color-navy)]">
              Nenhuma indicação cadastrada ainda
            </p>
            <div className="mt-5">
              <Link href="/presentes">
                <Button variant="outline">Ver lista de presentes</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ExternalProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer config={config} />
    </div>
  );
}
