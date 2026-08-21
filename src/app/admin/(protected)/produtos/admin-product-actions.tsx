"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  deleteProduct,
  toggleProductActive,
} from "@/lib/actions";
import { Button } from "@/components/ui";
import type { Product } from "@/db/schema";

export function AdminProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onToggle = () => {
    setError(null);
    startTransition(async () => {
      const res = await toggleProductActive(product.id, !product.active);
      if ("error" in res) setError(res.error);
      else router.refresh();
    });
  };

  const onDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if ("error" in res) {
        setError(res.error);
        setConfirmingDelete(false);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded-lg bg-[#fdecec] px-3 py-2 text-xs text-[#b85c5c]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/produtos/${product.id}`}
          className="inline-flex rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-navy)] hover:border-[var(--color-navy)]"
        >
          Editar
        </Link>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={onToggle}
        >
          {product.active ? "Desativar" : "Ativar"}
        </Button>
        {!confirmingDelete ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            className="text-[#b85c5c]"
          >
            Excluir
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={onDelete}
            >
              Confirmar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
