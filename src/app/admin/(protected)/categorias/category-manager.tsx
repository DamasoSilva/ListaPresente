"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteCategory,
  upsertCategory,
  type CategoryInput,
} from "@/lib/actions";
import type { Category } from "@/db/schema";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";

export function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryInput>({
    name: "",
    description: "",
    icon: "",
    order: 0,
    active: true,
  });

  const resetForm = () => {
    setForm({ name: "", description: "", icon: "", order: 0, active: true });
    setEditingId(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertCategory({
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

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description ?? "",
      icon: c.icon ?? "",
      order: c.order,
      active: c.active,
    });
  };

  const onDelete = (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCategory(id);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <Card padded={false}>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line-soft)] text-left text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
              <th className="px-4 py-3">Ícone</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Ordem</th>
              <th className="px-4 py-3">Ativo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-ink-soft)]">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--color-line-soft)] last:border-0"
                >
                  <td className="px-4 py-3 text-xl">{c.icon || "—"}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-mute)]">{c.slug}</td>
                  <td className="px-4 py-3">{c.order}</td>
                  <td className="px-4 py-3">{c.active ? "✓" : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(c)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#b85c5c]"
                        onClick={() => onDelete(c.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      <Card>
        <h2 className="font-display text-lg text-[var(--color-navy)]">
          {editingId ? "Editar categoria" : "Nova categoria"}
        </h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Field label="Nome *">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ícone (emoji)">
              <Input
                value={form.icon || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, icon: e.target.value.slice(0, 4) }))
                }
                placeholder="🍳"
              />
            </Field>
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
          <Field label="Descrição">
            <Textarea
              rows={2}
              value={form.description || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="h-4 w-4 accent-[var(--color-navy)]"
            />
            Ativa
          </label>
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
