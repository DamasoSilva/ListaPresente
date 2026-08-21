import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Login · Admin" };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-soft)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-navy)] text-white text-xl">
            ♥
          </div>
          <h1 className="mt-4 font-display text-3xl text-[var(--color-navy)]">
            Painel administrativo
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Acesse com suas credenciais para gerenciar a lista.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
