"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/db/schema";
import { cn, formatPrice, priorityLabel } from "@/lib/utils";
import { useCart } from "./cart-context";
import { Button } from "./ui";

export type ProductWithCategory = Product & {
  category?: { name: string; icon?: string | null } | null;
};

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const available = product.totalQuantity - product.reservedQuantity;
  const isReserved = available <= 0;
  const isPartial =
    product.totalQuantity > 1 && available > 0 && available < product.totalQuantity;
  const priority = priorityLabel(product.priority);
  const { addItem } = useCart();

  const onAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.imageUrl ?? null,
      price: product.price ?? null,
      available,
      total: product.totalQuantity,
      quantity: 1,
    });
  };

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl bg-white card-shadow transition-all duration-300 hover:-translate-y-1 hover:card-shadow",
        isReserved && "opacity-80"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-line-soft)]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {product.category?.icon || "🎁"}
          </div>
        )}
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-[var(--color-navy)]">
            ♥ Destaque
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink-soft)]">
          {product.priceRange}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--color-ink-mute)]">
          <span>
            {product.category?.icon} {product.category?.name || "Outros"}
          </span>
          <span className={priority.color}>
            {priority.emoji} {priority.label}
          </span>
        </div>
        <h3 className="font-display text-xl leading-snug text-[var(--color-navy)]">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-[var(--color-ink-soft)] line-clamp-2">
            {product.description}
          </p>
        )}
        {product.price && (
          <p className="text-xs text-[var(--color-ink-mute)]">
            Ref. {formatPrice(product.price)}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          {isReserved ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-rose-deep)]">
                ♡ Já escolhido
              </span>
              <Link
                href={`/presentes/${product.slug}`}
                className="w-full rounded-full border border-[var(--color-line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--color-navy)] hover:border-[var(--color-navy)] transition"
              >
                Ver detalhes
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Link
                  href={`/presentes/${product.slug}`}
                  className="flex-1 rounded-full bg-[var(--color-navy)] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[var(--color-navy-soft)] transition"
                >
                  🎁 Selecionar para Reserva
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onAdd}
                  aria-label={`Adicionar ${product.name} ao carrinho`}
                  className="px-3"
                >
                  🛒
                </Button>
              </div>
              {isPartial ? (
                <span className="text-xs text-[var(--color-sand-deep)]">
                  🟡 Restam {available} de {product.totalQuantity}
                </span>
              ) : (
                <span className="text-xs text-[var(--color-sage-deep)]">
                  ✓ Disponível
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
