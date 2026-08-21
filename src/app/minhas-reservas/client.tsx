"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Card, Field, Input } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

const STATUS: Record<string, { label: string; tone: "sage" | "sand" | "rose" | "sky" }> = {
  reservada: { label: "Reservada", tone: "sand" },
  confirmada: { label: "Confirmada", tone: "sky" },
  entregue: { label: "Entregue", tone: "sage" },
  cancelada: { label: "Cancelada", tone: "rose" },
};

type Reservation = {
  id: number;
  createdAt: string;
  status: string;
  quantity: number;
  message: string | null;
  publicToken: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  product: {
    id: number;
    name: string;
    imageUrl: string | null;
  } | null;
};

export function MinhasReservasClient() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Reservation[] | null>(null);
  const [searched, setSearched] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);
    setSearched(true);
    setLoading(true);
    try {
      const res = await fetch("/api/reservas/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível buscar suas reservas.");
        return;
      }
      setResults(data.reservations || []);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const groups = new Map<string, Reservation[]>();
  for (const r of (results || [])) {
    const key = r.publicToken || `single-${r.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const grouped = Array.from(groups.values());

  return (
    <>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
          Consulta de reservas
        </p>
        <h1 className="mt-3 font-display text-3xl text-[var(--color-navy)] md:text-4xl">
          Veja o que você reservou ❤️
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Informe o e-mail e telefone usados na reserva para consultar.
        </p>
      </div>

      <form onSubmit={lookup} className="mx-auto mt-8 max-w-md space-y-4">
        <Field label="E-mail *">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </Field>
        <Field label="Telefone (WhatsApp) *">
          <Input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(31) 99999-9999"
            inputMode="numeric"
          />
        </Field>
        {error && (
          <div className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#b85c5c]">
            {error}
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Buscando..." : "Buscar reservas"}
        </Button>
      </form>

      {searched && !loading && results && results.length === 0 && (
        <div className="mt-10 rounded-3xl bg-white p-12 text-center card-shadow">
          <p className="text-4xl">🎁</p>
          <p className="mt-3 font-display text-xl text-[var(--color-navy)]">
            Nenhuma reserva encontrada
          </p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Verifique se o e-mail e telefone estão corretos.
          </p>
        </div>
      )}

      {grouped.length > 0 && (
        <div className="mt-8 space-y-5">
          {grouped.map((group, gi) => (
            <Card key={gi} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
                  Reserva de {formatDateTime(group[0].createdAt)}
                </span>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  STATUS[group[0].status]?.tone === "sand" ? "bg-[var(--color-sand)] text-[var(--color-sand-deep)]" :
                  STATUS[group[0].status]?.tone === "sky" ? "bg-[var(--color-sky)] text-[var(--color-navy)]" :
                  STATUS[group[0].status]?.tone === "sage" ? "bg-[var(--color-sage)] text-[var(--color-sage-deep)]" :
                  STATUS[group[0].status]?.tone === "rose" ? "bg-[var(--color-rose)] text-[var(--color-navy)]" :
                  "bg-[var(--color-line-soft)] text-[var(--color-ink-soft)]"
                }`}>
                  {STATUS[group[0].status]?.label ?? group[0].status}
                </span>
              </div>
              <div className="space-y-3">
                {group.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 rounded-2xl bg-[var(--color-bg)] p-3"
                  >
                    <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-[var(--color-line-soft)]">
                      {r.product?.imageUrl ? (
                        <Image
                          src={r.product.imageUrl}
                          alt={r.product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">
                          🎁
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--color-navy)]">
                        {r.product?.name ?? "Presente"}
                      </p>
                      <p className="text-xs text-[var(--color-ink-mute)]">
                        {r.quantity} un.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {group[0].message && (
                <p className="rounded-2xl bg-[var(--color-bg)] p-4 text-sm italic text-[var(--color-ink-soft)]">
                  &ldquo;{group[0].message}&rdquo;
                </p>
              )}
              <p className="text-xs text-[var(--color-ink-mute)]">
                Código: <code className="rounded bg-[var(--color-line-soft)] px-1.5 py-0.5 text-[10px]">{group[0].publicToken}</code>
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
