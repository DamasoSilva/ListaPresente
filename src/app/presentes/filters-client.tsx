"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Category } from "@/db/schema";
import { Input, Select } from "@/components/ui";

type Initial = {
  q?: string;
  category?: string;
  priority?: string;
  price?: string;
  available?: string;
  sort?: string;
};

export function GiftFiltersClient({
  categories,
  initial,
}: {
  categories: Category[];
  initial: Initial;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(initial.q ?? "");
  const [, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.push(`/presentes?${params.toString()}`, { scroll: false });
    });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== (initial.q ?? "")) {
        update("q", q);
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mt-8 rounded-3xl bg-white p-5 card-shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-ink-soft)]">
            🔎 Procurar um presente
          </label>
          <Input
            placeholder="Ex: jogo de panelas, taças, air fryer..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="md:w-44">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-ink-soft)]">
            Categoria
          </label>
          <Select
            value={initial.category ?? ""}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.icon} {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:w-40">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-ink-soft)]">
            Prioridade
          </label>
          <Select
            value={initial.priority ?? ""}
            onChange={(e) => update("priority", e.target.value)}
          >
            <option value="">Todas</option>
            <option value="alta">🔴 Alta</option>
            <option value="media">🟡 Média</option>
            <option value="baixa">🟢 Baixa</option>
          </Select>
        </div>
        <div className="md:w-36">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-ink-soft)]">
            Preço
          </label>
          <Select
            value={initial.price ?? ""}
            onChange={(e) => update("price", e.target.value)}
          >
            <option value="">Todos</option>
            <option value="$">$ até R$ 50</option>
            <option value="$$">$$ R$ 51–100</option>
            <option value="$$$">$$$ R$ 101–250</option>
            <option value="$$$$">$$$$ R$ 251+</option>
          </Select>
        </div>
        <div className="md:w-48">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-ink-soft)]">
            Ordenar por
          </label>
          <Select
            value={initial.sort ?? "recommended"}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="recommended">Recomendados</option>
            <option value="priority">Prioridade</option>
            <option value="name">Nome</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="newest">Mais recentes</option>
          </Select>
        </div>
      </div>
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-ink-soft)]">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[var(--color-navy)]"
          checked={initial.available === "1"}
          onChange={(e) => update("available", e.target.checked ? "1" : "")}
        />
        Mostrar somente presentes disponíveis
      </label>
    </div>
  );
}
