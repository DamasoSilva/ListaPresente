import Image from "next/image";
import type { ExternalProduct } from "@/db/schema";
import { formatPrice } from "@/lib/utils";

export function ExternalProductCard({
  product,
}: {
  product: ExternalProduct;
}) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col overflow-hidden rounded-3xl bg-white card-shadow transition-all duration-300 hover:-translate-y-1"
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
          <div className="flex h-full items-center justify-center text-5xl">🛍️</div>
        )}
        {product.store && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-[var(--color-navy)]">
            {product.store}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {product.category && (
          <span className="text-[11px] uppercase tracking-wider text-[var(--color-ink-mute)]">
            {product.category}
          </span>
        )}
        <h3 className="font-display text-xl leading-snug text-[var(--color-navy)]">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-[var(--color-ink-soft)] line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          {product.price ? (
            <span className="text-sm font-medium text-[var(--color-navy)]">
              {formatPrice(product.price)}
            </span>
          ) : (
            <span />
          )}
          <span className="text-xs font-medium text-[var(--color-navy)] underline-offset-4 group-hover:underline">
            Ver produto ↗
          </span>
        </div>
      </div>
    </a>
  );
}
