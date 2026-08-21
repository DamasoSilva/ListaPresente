import Link from "next/link";
import { getSiteConfig } from "@/lib/config";
import { listProducts } from "@/lib/actions";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { GiftFiltersClient } from "./filters-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Presentes · Casa Nova",
  description: "Escolha e reserve um presente para nossa nova casa.",
};

type SearchParams = {
  q?: string;
  category?: string;
  priority?: string;
  price?: string;
  available?: string;
  sort?: string;
};

export default async function PresentesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const config = await getSiteConfig();
  const sp = await searchParams;

  const allCategories = await db.query.categories.findMany({
    where: eq(categories.active, true),
    orderBy: (c, { asc }) => [asc(c.order), asc(c.name)],
  });

  let categoryId: number | undefined;
  if (sp.category) {
    const found = allCategories.find(
      (c) => c.slug === sp.category || String(c.id) === sp.category
    );
    categoryId = found?.id;
  }

  const allProducts = await listProducts({
    search: sp.q,
    categoryId,
    priority: sp.priority,
    priceRange: sp.price,
    availableOnly: sp.available === "1",
    sort:
      (sp.sort as
        | "recommended"
        | "priority"
        | "name"
        | "price_asc"
        | "price_desc"
        | "newest") || "recommended",
  });

  const totals = await db
    .select({
      total: sql<number>`coalesce(sum(${products.totalQuantity}), 0)`,
      reserved: sql<number>`coalesce(sum(${products.reservedQuantity}), 0)`,
    })
    .from(products)
    .where(eq(products.active, true));
  const t = totals[0] || { total: 0, reserved: 0 };
  const totalItems = Number(t.total);
  const reservedItems = Number(t.reserved);
  const availableItems = totalItems - reservedItems;

  return (
    <div className="min-h-screen">
      <Header config={config} />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
            Nossa lista
          </p>
          <h1 className="mt-3 font-display text-4xl text-[var(--color-navy)] md:text-5xl">
            Encontre um presente para nossa casa ❤️
          </h1>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            {config.tipMessage}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat label="Total" value={totalItems} />
          <MiniStat label="Disponíveis" value={availableItems} />
          <MiniStat label="Escolhidos" value={reservedItems} />
          <MiniStat label="Produtos" value={allProducts.length} />
        </div>

        <GiftFiltersClient categories={allCategories} initial={sp} />

        {allProducts.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white p-12 text-center card-shadow">
            <p className="text-4xl">🔎</p>
            <p className="mt-3 font-display text-xl text-[var(--color-navy)]">
              Nenhum presente encontrado
            </p>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              Tente limpar os filtros ou buscar por outro termo.
            </p>
            <div className="mt-5">
              <Link
                href="/presentes"
                className="inline-flex rounded-full bg-[var(--color-navy)] px-5 py-2.5 text-sm font-medium text-white"
              >
                Limpar filtros
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer config={config} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center card-shadow-soft">
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-[var(--color-navy)]">
        {value}
      </p>
    </div>
  );
}
