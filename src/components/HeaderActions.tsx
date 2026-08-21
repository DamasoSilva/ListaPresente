"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./cart-context";

type Me = {
  authenticated: boolean;
  email?: string;
  name?: string | null;
  emailVerified?: boolean;
};

export function HeaderActions() {
  const { count } = useCart();
  const [me, setMe] = useState<Me | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/user/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active) setMe(d);
      })
      .catch(() => {
        if (active) setMe({ authenticated: false });
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    await fetch("/api/user/logout", { method: "POST" });
    setMe({ authenticated: false });
    setMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/carrinho"
        aria-label="Carrinho de presentes"
        className="relative rounded-full px-3 py-2 text-[var(--color-navy)] hover:bg-[var(--color-line-soft)]"
      >
        🛒
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-rose)] px-1 text-[11px] font-bold text-[var(--color-navy)]">
            {count}
          </span>
        )}
      </Link>

      <Link
        href="/minhas-reservas"
        className="rounded-full px-3 py-2 text-sm font-medium text-[var(--color-navy)] hover:bg-[var(--color-line-soft)]"
      >
        ♥ Minhas reservas
      </Link>

      {me?.authenticated && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-full px-3 py-2 text-sm font-medium text-[var(--color-navy)] hover:bg-[var(--color-line-soft)]"
          >
            {me.name ? me.name.split(" ")[0] : "Minha conta"} ▾
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white py-1 shadow-lg">
              <Link
                href="/minhas-reservas"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-[var(--color-navy)] hover:bg-[var(--color-line-soft)]"
              >
                ♥ Minhas reservas
              </Link>
              {!me.emailVerified && (
                <span className="block px-4 py-2 text-xs text-[var(--color-sand-deep)]">
                  Confirme seu e-mail
                </span>
              )}
              <button
                type="button"
                onClick={logout}
                className="block w-full px-4 py-2 text-left text-sm text-[#b85c5c] hover:bg-[#fdecec]"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
