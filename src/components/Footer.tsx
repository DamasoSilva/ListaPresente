import Link from "next/link";
import type { SiteConfig } from "@/lib/config";
import { whatsappLink } from "@/lib/utils";

export function Footer({ config }: { config: SiteConfig }) {
  const shareUrl = config.siteUrl || "https://exemplo.com";
  const shareText = `Vem escolher um presente para a nossa casa nova! ${shareUrl}`;
  return (
    <footer className="mt-20 border-t border-[var(--color-line-soft)] bg-[var(--color-bg-soft)]">
      <div className="mx-auto max-w-6xl px-5 py-14 text-center">
        <p className="font-display text-2xl text-[var(--color-navy)]">
          {config.footerThanks}
        </p>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
          {config.coupleNames} <span className="text-[var(--color-rose-deep)]">♥</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {config.whatsapp && (
            <a
              href={whatsappLink(config.whatsapp, "Olá! Vi a lista de presentes e quero falar com vocês.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-navy)] hover:border-[var(--color-navy)] transition"
            >
              💬 Falar com o casal
            </a>
          )}
          {config.instagram && (
            <a
              href={config.instagram.startsWith("http") ? config.instagram : `https://instagram.com/${config.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-navy)] hover:border-[var(--color-navy)] transition"
            >
              📷 Instagram
            </a>
          )}
          <a
            href={whatsappLink("", shareText)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-navy)] px-4 py-2 text-sm text-white hover:bg-[var(--color-navy-soft)] transition"
          >
            ↗ Compartilhar lista
          </a>
          <Link
            href="/presentes"
            className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-navy)] hover:border-[var(--color-navy)] transition"
          >
            Ver presentes
          </Link>
        </div>
        <p className="mt-10 text-xs text-[var(--color-ink-mute)]">
          Feito com carinho para celebrar nosso novo lar.
        </p>
        <p className="mt-2 text-xs text-[var(--color-ink-mute)]">
          Desenvolvido por: Damaso Silva
        </p>
      </div>
    </footer>
  );
}
