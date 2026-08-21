"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input } from "./ui";
import { formatPhone, phoneDigits } from "@/lib/utils";

export function AuthPanel({
  onDone,
  intro,
}: {
  onDone?: () => void;
  intro?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onPhoneChange = (v: string) => {
    const digits = phoneDigits(v).slice(0, 13);
    setPhone(formatPhone(digits));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/user/login" : "/api/user/signup";
      const body =
        mode === "login"
          ? { email, password }
          : { name, email, phone, password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível continuar.");
        return;
      }
      router.refresh();
      onDone?.();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      {intro && (
        <p className="mb-4 text-center text-sm text-[var(--color-ink-soft)]">
          {intro}
        </p>
      )}
      <div className="mb-5 flex rounded-full bg-[var(--color-line-soft)] p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full py-2 transition ${
            mode === "login"
              ? "bg-white text-[var(--color-navy)] shadow-sm"
              : "text-[var(--color-ink-soft)]"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-2 transition ${
            mode === "signup"
              ? "bg-white text-[var(--color-navy)] shadow-sm"
              : "text-[var(--color-ink-soft)]"
          }`}
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-6 card-shadow">
        {mode === "signup" && (
          <Field label="Seu nome *">
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você gosta de ser chamado(a)"
              maxLength={200}
            />
          </Field>
        )}
        {mode === "signup" && (
          <Field label="Telefone (WhatsApp) *" hint="Usamos para contato sobre os presentes.">
            <Input
              required
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="(31) 99999-9999"
              inputMode="numeric"
            />
          </Field>
        )}
        <Field label="E-mail *">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Senha *">
          <Input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "Sua senha"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </Field>
        {error && (
          <div className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#b85c5c]">
            {error}
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading
            ? "Aguarde..."
            : mode === "login"
              ? "Entrar"
              : "Criar conta e continuar"}
        </Button>
        {mode === "signup" && (
          <p className="text-center text-xs text-[var(--color-ink-mute)]">
            Enviaremos um e-mail para confirmar seu endereço.
          </p>
        )}
      </form>
    </div>
  );
}
