"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui";
import { useCart } from "./cart-context";

type Props = {
  product: {
    id: number;
    slug: string;
    name: string;
    image?: string | null;
    price?: string | null;
    available: number;
    total: number;
  };
};

export function AddToCart({ product }: Props) {
  const { addItem } = useCart();
  const max = Math.min(product.available, 10);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image ?? null,
      price: product.price ?? null,
      available: product.available,
      total: product.total,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="rounded-3xl bg-white p-6 card-shadow">
      <p className="font-display text-xl text-[var(--color-navy)]">
        Adicionar ao carrinho de presentes ❤️
      </p>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        Escolha a quantidade e junte este presente ao seu carrinho. Você pode
        reservar vários presentes de uma vez.
      </p>

      {product.total > 1 && (
        <div className="mt-5">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-ink-soft)]">
            Quantidade (máx. {product.available})
          </span>
          <div className="mt-2 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              −
            </Button>
            <span className="w-10 text-center font-display text-xl text-[var(--color-navy)]">
              {quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuantity((q) => Math.min(max, q + 1))}
              disabled={quantity >= max}
            >
              +
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onAdd}
        >
          🛒 Adicionar ao carrinho
        </Button>
      </div>

      {added && (
        <div className="mt-4 rounded-2xl bg-[var(--color-sage)] p-4 text-sm text-[var(--color-sage-deep)]">
          Adicionado!{" "}
          <Link
            href="/carrinho"
            className="font-semibold underline underline-offset-2"
          >
            Ir para o carrinho
          </Link>
        </div>
      )}
    </div>
  );
}
