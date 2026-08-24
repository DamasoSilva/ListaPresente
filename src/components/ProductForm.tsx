"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertProduct } from "@/lib/actions";
import type { Product, Category } from "@/db/schema";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { ImageUploader } from "./ImageUploader";

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Product;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initialImages = initial?.images?.length
    ? initial.images
    : initial?.imageUrl
      ? [initial.imageUrl]
      : [];

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    fullDescription: initial?.fullDescription ?? "",
    categoryId: initial?.categoryId ?? 0,
    images: initialImages,
    totalQuantity: initial?.totalQuantity ?? 1,
    price: initial?.price ?? "",
    priceRange: initial?.priceRange ?? "$$",
    priority: initial?.priority ?? "media",
    brand: initial?.brand ?? "",
    model: initial?.model ?? "",
    notes: initial?.notes ?? "",
    externalLink: initial?.externalLink ?? "",
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
    order: initial?.order ?? 0,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        ...(initial ? { id: initial.id } : {}),
        name: form.name,
        description: form.description || undefined,
        fullDescription: form.fullDescription || undefined,
        categoryId: form.categoryId || null,
        imageUrl: form.images[0] || undefined,
        images: form.images,
        totalQuantity: Number(form.totalQuantity) || 1,
        price: form.price || null,
        priceRange: form.priceRange,
        priority: form.priority,
        brand: form.brand || undefined,
        model: form.model || undefined,
        notes: form.notes || undefined,
        externalLink: form.externalLink || undefined,
        featured: form.featured,
        active: form.active,
        order: Number(form.order) || 0,
      };
      const res = await upsertProduct(payload);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push("/admin/produtos");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome *">
          <Input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Categoria">
          <Select
            value={String(form.categoryId || 0)}
            onChange={(e) => update("categoryId", Number(e.target.value))}
          >
            <option value="0">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Descrição curta">
        <Input
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Ex: Para deixar nossa cozinha completa."
        />
      </Field>
      <Field label="Descrição completa">
        <Textarea
          rows={4}
          value={form.fullDescription}
          onChange={(e) => update("fullDescription", e.target.value)}
        />
      </Field>

      <Field
        label="Fotos do produto"
        hint="Envie até 5 imagens. A primeira será a capa (usada nos cards e na galeria)."
      >
        <ImageUploader
          value={form.images}
          onChange={(next) => update("images", next)}
          max={5}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Quantidade total *">
          <Input
            type="number"
            min={1}
            required
            value={form.totalQuantity}
            onChange={(e) =>
              update("totalQuantity", Number(e.target.value) || 1)
            }
          />
        </Field>
        <Field label="Ordem de exibição">
          <Input
            type="number"
            value={form.order}
            onChange={(e) => update("order", Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Faixa de preço">
          <Select
            value={form.priceRange}
            onChange={(e) => update("priceRange", e.target.value)}
          >
            <option value="$">$ até R$ 50</option>
            <option value="$$">$$ R$ 51–100</option>
            <option value="$$$">$$$ R$ 101–250</option>
            <option value="$$$$">$$$$ R$ 251+</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Preço (referência)">
          <Input
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="299.00"
          />
        </Field>
        <Field label="Prioridade">
          <Select
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
          >
            <option value="alta">🔴 Alta</option>
            <option value="media">🟡 Média</option>
            <option value="baixa">🟢 Baixa</option>
          </Select>
        </Field>
        <Field label="Marca">
          <Input
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Modelo">
          <Input
            value={form.model}
            onChange={(e) => update("model", e.target.value)}
          />
        </Field>
        <Field label="Link externo (opcional)">
          <Input
            value={form.externalLink}
            onChange={(e) => update("externalLink", e.target.value)}
            placeholder="https://www.amazon.com.br/..."
          />
        </Field>
      </div>
      <Field label="Observações internas">
        <Textarea
          rows={2}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </Field>
      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-navy)]"
          />
          Destacar na home
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => update("active", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-navy)]"
          />
          Ativo (visível no site)
        </label>
      </div>
      {error && (
        <div className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#b85c5c]">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/produtos")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : initial ? "Salvar alterações" : "Criar presente"}
        </Button>
      </div>
    </form>
  );
}
