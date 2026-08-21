"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useCart } from "@/components/cart-context";
import { createReservations } from "@/lib/user-actions";
import { formatPrice, whatsappLink } from "@/lib/utils";

type Done = {
  groupId: string;
  reservations: {
    productId: number;
    productName: string;
    quantity: number;
    publicToken: string;
  }[];
};

export function CarrinhoCheckout() {
  const { items, removeItem, updateQuantity, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  if (done) {
    const shareMessage = `Reservei presente(s) para a nova casa! ❤️ Veja a lista: ${typeof window !== "undefined" ? window.location.origin : ""}/presentes`;
    return (
      <div className="animate-pop rounded-3xl bg-[var(--color-blush)] p-8 text-center card-shadow">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl">
          🎁
        </div>
        <h3 className="mt-5 font-display text-2xl text-[var(--color-navy)]">
          Presentes reservados! ❤️
        </h3>
        <p className="mt-2 text-[var(--color-ink-soft)]">
          Obrigado, <strong>{name}</strong>! Você acaba de fazer parte da nossa
          nova casa.
        </p>
        <div className="mt-5 space-y-2 rounded-2xl bg-white p-4 text-left text-sm text-[var(--color-ink-soft)]">
          {done.reservations.map((r) => (
            <div key={r.publicToken} className="flex justify-between gap-3">
              <span className="text-[var(--color-navy)]">{r.productName}</span>
              <span>
                {r.quantity} un. ·{" "}
                <code className="text-xs">
                  {r.publicToken.slice(0, 10)}…
                </code>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/presentes"
            className="inline-flex rounded-full bg-[var(--color-navy)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-navy-soft)]"
          >
            Ver Presentes
          </Link>
          <Link
            href="/minhas-reservas"
            className="inline-flex rounded-full bg-[var(--color-sage-deep)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Ver minhas reservas
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center card-shadow">
        <p className="text-4xl">🛒</p>
        <p className="mt-3 font-display text-xl text-[var(--color-navy)]">
          Seu carrinho está vazio
        </p>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Escolha presentes na lista e adicione-os aqui.
        </p>
        <Link
          href="/presentes"
          className="mt-5 inline-flex rounded-full bg-[var(--color-navy)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Ver presentes
        </Link>
      </div>
    );
  }

  const finalize = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await createReservations({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        message,
        idempotencyKey: crypto.randomUUID(),
      });
      if ("error" in res) {
        setError(res.error);
        return;
      }
      clear();
      setDone(res);
    } catch {
      setError("Não conseguimos concluir agora. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 card-shadow"
          >
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl bg-[var(--color-line-soft)]">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">
                  🎁
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[var(--color-navy)]">
                {item.name}
              </p>
              {item.price && (
                <p className="text-xs text-[var(--color-ink-mute)]">
                  {formatPrice(item.price)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="h-8 w-8 rounded-full border border-[var(--color-line)] text-[var(--color-navy)] disabled:opacity-40"
                aria-label="Diminuir"
              >
                −
              </button>
              <span className="w-6 text-center font-display text-[var(--color-navy)]">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.available}
                className="h-8 w-8 rounded-full border border-[var(--color-line)] text-[var(--color-navy)] disabled:opacity-40"
                aria-label="Aumentar"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="h-8 w-8 rounded-full text-[#b85c5c] hover:bg-[#fdecec]"
              aria-label="Remover"
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6 card-shadow space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome completo *">
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              maxLength={200}
            />
          </Field>
          <Field label="E-mail *">
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              maxLength={255}
            />
          </Field>
        </div>
        <Field label="Telefone (WhatsApp) *">
          <Input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(31) 99999-9999"
            inputMode="numeric"
            maxLength={40}
          />
        </Field>
        <Field label="Mensagem para o casal (única para todos os presentes)">
          <Textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Deixe um recadinho para a Cíntia e o Damaso..."
            maxLength={1000}
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#b85c5c]">
          {error}
        </div>
      )}

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={submitting}
        onClick={finalize}
      >
        {submitting
          ? "Reservando..."
          : `🎁 Reservar ${items.reduce((s, i) => s + i.quantity, 0)} presente(s)`}
      </Button>
    </div>
  );
}
