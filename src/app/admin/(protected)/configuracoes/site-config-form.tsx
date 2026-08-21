"use client";

import { useState, useTransition } from "react";
import { saveSiteConfig } from "@/lib/config-actions";
import type { SiteConfig } from "@/lib/config";
import { Button, Field, Input, Textarea } from "@/components/ui";

export function SiteConfigForm({ initial }: { initial: SiteConfig }) {
  const [form, setForm] = useState<SiteConfig>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof SiteConfig>(k: K, v: SiteConfig[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await saveSiteConfig(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch {
        setError("Não foi possível salvar. Tente novamente.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Identidade do casal">
        <Field label="Nome do casal">
          <Input
            value={form.coupleNames}
            onChange={(e) => update("coupleNames", e.target.value)}
          />
        </Field>
        <Field label="Foto do casal (URL)">
          <Input
            value={form.couplePhoto}
            onChange={(e) => update("couplePhoto", e.target.value)}
            placeholder="https://..."
          />
        </Field>
        <Field label="Foto da casa (URL)">
          <Input
            value={form.housePhoto}
            onChange={(e) => update("housePhoto", e.target.value)}
          />
        </Field>
        <Field label="Data da mudança">
          <Input
            value={form.moveDate}
            onChange={(e) => update("moveDate", e.target.value)}
            placeholder="Março de 2026"
          />
        </Field>
      </Section>

      <Section title="Página inicial">
        <Field label="Título principal">
          <Input
            value={form.welcomeTitle}
            onChange={(e) => update("welcomeTitle", e.target.value)}
          />
        </Field>
        <Field label="Subtítulo">
          <Input
            value={form.welcomeSubtitle}
            onChange={(e) => update("welcomeSubtitle", e.target.value)}
          />
        </Field>
        <Field label="Mensagem de boas-vindas">
          <Textarea
            rows={3}
            value={form.welcomeMessage}
            onChange={(e) => update("welcomeMessage", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Como funciona">
        <Field label="Título da seção">
          <Input
            value={form.howItWorksTitle}
            onChange={(e) => update("howItWorksTitle", e.target.value)}
          />
        </Field>
        <Field
          label="Passos (um por linha)"
          hint="Cada linha vira um passo numerado."
        >
          <Textarea
            rows={5}
            value={form.howItWorksSteps.join("\n")}
            onChange={(e) =>
              update(
                "howItWorksSteps",
                e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
              )
            }
          />
        </Field>
        <Field label="Mensagem final">
          <Input
            value={form.howItWorksFooter}
            onChange={(e) => update("howItWorksFooter", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Contato e redes">
        <Field label="WhatsApp (com DDD)">
          <Input
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="31999999999"
          />
        </Field>
        <Field label="Instagram (@usuario ou URL)">
          <Input
            value={form.instagram}
            onChange={(e) => update("instagram", e.target.value)}
          />
        </Field>
        <Field label="URL do site">
          <Input
            value={form.siteUrl}
            onChange={(e) => update("siteUrl", e.target.value)}
            placeholder="https://minhalista.com.br"
          />
        </Field>
      </Section>

      <Section title="SEO & compartilhamento">
        <Field label="Título (meta)">
          <Input
            value={form.metaTitle}
            onChange={(e) => update("metaTitle", e.target.value)}
          />
        </Field>
        <Field label="Descrição (meta)">
          <Textarea
            rows={2}
            value={form.metaDescription}
            onChange={(e) => update("metaDescription", e.target.value)}
          />
        </Field>
        <Field label="Mensagem de compartilhamento">
          <Input
            value={form.shareMessage}
            onChange={(e) => update("shareMessage", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Comportamento">
        <Field label="Dica (acima dos filtros)">
          <Input
            value={form.tipMessage}
            onChange={(e) => update("tipMessage", e.target.value)}
          />
        </Field>
        <Field label="Mensagem de confirmação">
          <Textarea
            rows={2}
            value={form.confirmationMessage}
            onChange={(e) => update("confirmationMessage", e.target.value)}
          />
        </Field>
        <Field label="Rodapé / agradecimento">
          <Input
            value={form.footerThanks}
            onChange={(e) => update("footerThanks", e.target.value)}
          />
        </Field>
        <div className="flex flex-wrap gap-4">
          <Toggle
            label="Mostrar nome dos convidados"
            value={form.showGuestNames}
            onChange={(v) => update("showGuestNames", v)}
          />
          <Toggle
            label="Mostrar progresso da lista"
            value={form.showProgress}
            onChange={(v) => update("showProgress", v)}
          />
          <Toggle
            label="Mostrar contadores"
            value={form.showCounters}
            onChange={(v) => update("showCounters", v)}
          />
        </div>
      </Section>

      {error && (
        <p className="rounded-xl bg-[#fdecec] px-4 py-2 text-sm text-[#b85c5c]">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-xl bg-[var(--color-sage)] px-4 py-2 text-sm text-[var(--color-sage-deep)]">
          ✓ Configurações salvas com sucesso.
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 border-b border-[var(--color-line-soft)] pb-6 last:border-0">
      <h2 className="font-display text-lg text-[var(--color-navy)]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-navy)]"
      />
      {label}
    </label>
  );
}
