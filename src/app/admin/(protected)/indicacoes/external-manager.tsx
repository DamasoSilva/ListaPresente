"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteExternalProduct,
  upsertExternalProduct,
  type ExternalProductInput,
} from "@/lib/actions";
import type { ExternalProduct } from "@/db/schema";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

const EMPTY: ExternalProductInput = {
  name: "",
  description: "",
  imageUrl: "",
  store: "",
  price: "",
  url: "",
  category: "",
  featured: false,
  active: true,
  order: 0,
};

export function ExternalManager({
  initial,
}: {
  initial: ExternalProduct[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExternalProductInput>(EMPTY);

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertExternalProduct({
        ...(editingId ? { id: editingId } : {}),
        ...form,
      });
      if ("error" in res) {
        setError(res.error);
        return;
      }
      resetForm();
      router.refresh();
    });
  };

  const startEdit = (p: ExternalProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      imageUrl: p.imageUrl ?? "",
      store: p.store ?? "",
      price: p.price ?? "",
      url: p.url,
      category: p.category ?? "",
      featured: p.featured,
      active: p.active,
      order: p.order,
    });
  };

  const onDelete = (id: number) => {
    if (!confirm("Excluir esta indicação?")) return;
    startTransition(async () => {
      const res = await deleteExternalProduct(id);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_400px]">
      <div className="space-y-3">
        {initial.length === 0 ? (
          <Card>
            <p className="text-center text-[var(--color-ink-soft)]">
              Nenhuma indicação cadastrada.
            </p>
          </Card>
        ) : (
          initial.map((p) => (
            <Card key={p.id} className="flex items-start gap-4">
              <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-[var(--color-line-soft)]">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    🛍️
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-display text-lg text-[var(--color-navy)]">
                  {p.name}
                </p>
                <p className="text-xs text-[var(--color-ink-mute)]">
                  {p.store || "—"} · {p.price ? formatPrice(p.price) : "—"} ·{" "}
                  {p.category || "—"}
                </p>
                {p.description && (
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)] line-clamp-2">
                    {p.description}
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#b85c5c]"
                    onClick={() => onDelete(p.id)}
                  >
                    Excluir
                  </Button>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full px-2 py-1 text-xs text-[var(--color-navy)] hover:bg-[var(--color-line-soft)]"
                  >
                    Abrir link ↗
                  </a>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <Card>
        <h2 className="font-display text-lg text-[var(--color-navy)]">
          {editingId ? "Editar indicação" : "Nova indicação"}
        </h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Field label="Nome *">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="URL *">
            <Input
              required
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loja">
              <Input
                value={form.store || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, store: e.target.value }))
                }
                placeholder="Amazon, Magalu..."
              />
            </Field>
            <Field label="Preço (ref.)">
              <Input
                value={form.price || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="499.00"
              />
            </Field>
          </div>
          <Field label="Categoria">
            <Input
              value={form.category || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            />
          </Field>
          <Field label="Imagem (URL)">
            <Input
              value={form.imageUrl || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
            />
          </Field>
          <Field label="Descrição">
            <Textarea
              rows={2}
              value={form.description || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ordem">
              <Input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))
                }
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
                className="h-4 w-4 accent-[var(--color-navy)]"
              />
              Destaque
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
                className="h-4 w-4 accent-[var(--color-navy)]"
              />
              Ativo
            </label>
          </div>
          {error && (
            <p className="rounded-xl bg-[#fdecec] px-4 py-2 text-sm text-[#b85c5c]">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "..." : editingId ? "Salvar" : "Criar"}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
