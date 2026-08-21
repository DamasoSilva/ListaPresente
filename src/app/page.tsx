import Image from "next/image";
import Link from "next/link";
import { getSiteConfig } from "@/lib/config";
import { listProducts } from "@/lib/actions";
import { db } from "@/db";
import { products } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: config.metaTitle,
    description: config.metaDescription,
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      type: "website",
      images: config.couplePhoto ? [config.couplePhoto] : [],
    },
  };
}

export default async function HomePage() {
  const config = await getSiteConfig();
  const featured = await listProducts({
    featuredOnly: true,
    sort: "recommended",
    limit: 6,
  });
  const allProducts = await db
    .select({
      total: sql<number>`coalesce(sum(${products.totalQuantity}), 0)`,
      reserved: sql<number>`coalesce(sum(${products.reservedQuantity}), 0)`,
      active: sql<number>`count(*) filter (where ${products.active} = true)`,
    })
    .from(products)
    .where(eq(products.active, true));
  const stats = allProducts[0] || { total: 0, reserved: 0, active: 0 };
  const totalItems = Number(stats.total);
  const reservedItems = Number(stats.reserved);
  const availableItems = totalItems - reservedItems;
  const activeProducts = Number(stats.active);

  const progress =
    totalItems > 0 ? Math.round((reservedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Header config={config} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-blush)] via-[var(--color-bg-soft)] to-[var(--color-bg)]" />
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-16 text-center md:pt-24">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-ink-mute)]">
            {config.welcomeSubtitle}
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-[var(--color-navy)] md:text-7xl">
            {config.welcomeTitle}
          </h1>
          <p className="mt-3 font-display text-2xl text-[var(--color-rose-deep)] md:text-3xl">
            {config.coupleNames}{" "}
            <span className="text-[var(--color-rose-deep)]">♥</span>
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-[var(--color-ink-soft)] md:text-lg">
            {config.welcomeMessage}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/presentes">
              <Button size="lg">🎁 Ver lista de presentes</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SOBRE O CASAL */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-[var(--color-line-soft)] card-shadow">
            {config.couplePhoto ? (
              <Image
                src={config.couplePhoto}
                alt={config.coupleNames}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl">♥</div>
                  <p className="mt-3 text-sm uppercase tracking-[0.2em] text-[var(--color-ink-mute)]">
                    Foto do casal
                  </p>
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
              Uma nova fase
            </p>
            <h2 className="mt-3 font-display text-4xl text-[var(--color-navy)] md:text-5xl">
              Estamos começando nosso novo lar
            </h2>
            <p className="mt-4 text-[var(--color-ink-soft)] md:text-lg">
              Estamos começando uma nova fase juntos e queremos compartilhar esse
              momento especial com as pessoas que fazem parte da nossa história.
              Cada presente é um pedacinho de carinho que vai nos acompanhar em
              todos os dias dessa nova casa.
            </p>
            {config.moveDate && (
              <p className="mt-4 text-sm text-[var(--color-ink-mute)]">
                📅 Nossa mudança está marcada para{" "}
                <strong className="text-[var(--color-navy)]">{config.moveDate}</strong>.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-10 rounded-3xl bg-white p-8 md:grid-cols-2 md:p-12 card-shadow">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-rose)] text-xl">
              ♥
            </div>
            <p className="mt-6 font-display text-2xl leading-snug text-[var(--color-navy)] md:text-3xl">
              {config.welcomeMessage}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
              🎁 {config.howItWorksTitle}
            </p>
            <ol className="mt-5 space-y-4">
              {config.howItWorksSteps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--color-sky)] font-display text-base font-semibold text-[var(--color-navy)]">
                    {i + 1}
                  </span>
                  <p className="text-[var(--color-ink-soft)]">{step}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-[var(--color-ink-mute)] italic">
              {config.howItWorksFooter}
            </p>
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      {config.showCounters && (
        <section className="mx-auto max-w-6xl px-5 py-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatCard tone="sky" label="Total de itens" value={totalItems} />
            <StatCard tone="sage" label="Disponíveis" value={availableItems} />
            <StatCard tone="sand" label="Reservados" value={reservedItems} />
            <StatCard
              tone="rose"
              label="Produtos ativos"
              value={activeProducts}
            />
          </div>
          {config.showProgress && totalItems > 0 && (
            <div className="mt-6 rounded-3xl bg-white p-6 card-shadow-soft">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-ink-soft)]">
                  Progresso da lista
                </span>
                <span className="font-medium text-[var(--color-navy)]">
                  {progress}% escolhido ❤️
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-line-soft)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-deep)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* DESTAQUES */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-10">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
                Destaques
              </p>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-navy)] md:text-4xl">
                Alguns dos nossos presentes favoritos
              </h2>
            </div>
            <Link href="/presentes">
              <Button variant="outline">Ver todos os presentes →</Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer config={config} />
    </div>
  );
}

function StatCard({
  tone,
  label,
  value,
}: {
  tone: "sky" | "sage" | "sand" | "rose";
  label: string;
  value: number;
}) {
  const tones = {
    sky: "bg-[var(--color-sky)] text-[var(--color-navy)]",
    sage: "bg-[var(--color-sage)] text-[var(--color-sage-deep)]",
    sand: "bg-[var(--color-sand)] text-[var(--color-sand-deep)]",
    rose: "bg-[var(--color-rose)] text-[var(--color-navy)]",
  } as const;
  return (
    <div className="rounded-3xl p-5 card-shadow-soft bg-white">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${tones[tone]}`}
      >
        <span className="font-display text-lg font-semibold">{value}</span>
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl text-[var(--color-navy)]">
        {value}
      </p>
    </div>
  );
}
