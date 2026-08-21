import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { products, reservations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSiteConfig } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge, Button, Card } from "@/components/ui";
import { formatPrice, priorityLabel } from "@/lib/utils";
import { ProductCarousel } from "@/components/ProductCarousel";
import { AddToCart } from "@/components/AddToCart";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });
  if (!product) return { title: "Presente não encontrado" };
  return {
    title: `${product.name} · Lista de Presentes`,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const config = await getSiteConfig();

  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.active, true)),
    with: { category: true },
  });
  if (!product) return notFound();

  const available = product.totalQuantity - product.reservedQuantity;
  const isReserved = available <= 0;
  const priority = priorityLabel(product.priority);
  const gallery = product.images?.length
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  // Fetch reservations for display (admin-only visibility of names)
  const resList = config.showGuestNames
    ? await db.query.reservations.findMany({
        where: and(
          eq(reservations.productId, product.id),
          eq(reservations.status, "reservada")
        ),
        orderBy: (r, { desc }) => desc(r.createdAt),
      })
    : [];

  return (
    <div className="min-h-screen">
      <Header config={config} />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <nav className="mb-6 text-sm text-[var(--color-ink-mute)]">
          <Link href="/presentes" className="hover:text-[var(--color-navy)]">
            ← Voltar para a lista
          </Link>
        </nav>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-[var(--color-line-soft)] card-shadow">
            <ProductCarousel
              images={gallery}
              alt={product.name}
              icon={product.category?.icon}
            />
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <Badge tone="sky">
                  {product.category.icon} {product.category.name}
                </Badge>
              )}
              <Badge tone="neutral">
                {priority.emoji} Prioridade {priority.label}
              </Badge>
              <Badge tone="neutral">{product.priceRange}</Badge>
              {product.featured && <Badge tone="rose">♥ Destaque</Badge>}
            </div>
            <h1 className="font-display text-3xl text-[var(--color-navy)] md:text-4xl">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-[var(--color-ink-soft)]">
                {product.description}
              </p>
            )}
            {product.fullDescription && (
              <p className="whitespace-pre-wrap text-sm text-[var(--color-ink-soft)]">
                {product.fullDescription}
              </p>
            )}
            {product.price && (
              <p className="text-sm text-[var(--color-ink-mute)]">
                Referência:{" "}
                <strong className="text-[var(--color-navy)]">
                  {formatPrice(product.price)}
                </strong>
              </p>
            )}

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
                    Disponibilidade
                  </p>
                  <p className="mt-1 font-display text-2xl text-[var(--color-navy)]">
                    {available} de {product.totalQuantity}
                  </p>
                </div>
                {isReserved ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-rose)] px-3 py-1.5 text-sm font-medium text-[var(--color-navy)]">
                    ♡ Já escolhido
                  </span>
                ) : product.totalQuantity > 1 &&
                  available < product.totalQuantity ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-sand)] px-3 py-1.5 text-sm font-medium text-[var(--color-sand-deep)]">
                    🟡 Restam {available}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-sage)] px-3 py-1.5 text-sm font-medium text-[var(--color-sage-deep)]">
                    ✓ Disponível
                  </span>
                )}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-line-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--color-sage-deep)] transition-all"
                  style={{
                    width: `${
                      (product.reservedQuantity / product.totalQuantity) * 100
                    }%`,
                  }}
                />
              </div>
            </Card>

            {isReserved ? (
              <div className="rounded-3xl bg-[var(--color-blush)] p-6 text-center">
                <p className="font-display text-xl text-[var(--color-navy)]">
                  Este presente já encontrou uma pessoa especial para levá-lo
                  para nossa casa ❤️
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                  Obrigado por pensar em nós! Escolha outro presente da lista.
                </p>
                <Link
                  href="/presentes"
                  className="mt-4 inline-flex rounded-full bg-[var(--color-navy)] px-5 py-2.5 text-sm font-medium text-white"
                >
                  Ver outros presentes
                </Link>
              </div>
            ) : (
              <AddToCart
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: gallery[0] ?? product.imageUrl ?? null,
                  price: product.price,
                  available,
                  total: product.totalQuantity,
                }}
              />
            )}

            {config.showGuestNames && resList.length > 0 && (
              <Card>
                <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
                  Quem já reservou
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-ink-soft)]">
                  {resList.map((r) => (
                    <li key={r.id}>
                      ♥ {r.guestName} · {r.quantity} un.
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {product.externalLink && (
              <a
                href={product.externalLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline text-[var(--color-navy)] underline-offset-4 hover:text-[var(--color-navy-soft)]"
              >
                ↗ Ver onde comprar (link externo)
              </a>
            )}
          </div>
        </div>
      </main>
      <Footer config={config} />
    </div>
  );
}
