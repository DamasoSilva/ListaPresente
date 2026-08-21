"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: "🎁" },
  { href: "/admin/categorias", label: "Categorias", icon: "🏷️" },
  { href: "/admin/reservas", label: "Reservas", icon: "📝" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
              active
                ? "bg-[var(--color-navy)] text-white"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-line-soft)]"
            )}
          >
            <span className="text-base">{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--color-line-soft)] bg-white px-4 py-3 md:hidden">
        <span className="font-display text-lg text-[var(--color-navy)]">
          Admin
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-full bg-[var(--color-navy)] px-3 py-1.5 text-xs font-medium text-white"
        >
          {open ? "Fechar" : "Menu"}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5">
            <div className="mb-6 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-navy)] text-white">
                ♥
              </span>
              <span className="font-display text-lg text-[var(--color-navy)]">
                Admin
              </span>
            </div>
            {nav}
            <div className="mt-8 border-t border-[var(--color-line-soft)] pt-4">
              <p className="text-xs text-[var(--color-ink-mute)]">{email}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start"
                onClick={logout}
              >
                Sair
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-none flex-col border-r border-[var(--color-line-soft)] bg-white p-5 md:flex">
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-navy)] text-white">
            ♥
          </span>
          <div>
            <p className="font-display text-lg leading-tight text-[var(--color-navy)]">
              Admin
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-ink-mute)]">
              Casa Nova
            </p>
          </div>
        </div>
        {nav}
        <div className="mt-auto border-t border-[var(--color-line-soft)] pt-4">
          <p className="text-xs text-[var(--color-ink-mute)] truncate">{email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start"
            onClick={logout}
          >
            Sair
          </Button>
          <Link
            href="/"
            className="mt-1 block w-full rounded-xl px-3 py-1.5 text-xs text-[var(--color-ink-soft)] hover:bg-[var(--color-line-soft)]"
          >
            ← Ver site público
          </Link>
        </div>
      </aside>
    </>
  );
}
