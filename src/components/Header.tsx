import Link from "next/link";
import type { SiteConfig } from "@/lib/config";
import { HeaderActions } from "./HeaderActions";

export function Header({ config }: { config: SiteConfig }) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/85 backdrop-blur border-b border-[var(--color-line-soft)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-rose)] text-[var(--color-navy)] group-hover:bg-[var(--color-rose-deep)] group-hover:text-white transition">
            ♥
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold text-[var(--color-navy)]">
              {config.coupleNames}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
              Casa Nova
            </span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link
            href="/presentes"
            className="px-3 py-2 rounded-full hover:bg-[var(--color-line-soft)] text-[var(--color-navy)]"
          >
            Presentes
          </Link>
          <HeaderActions />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/presentes"
            className="px-3 py-2 text-sm text-[var(--color-navy)]"
          >
            Presentes
          </Link>
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
