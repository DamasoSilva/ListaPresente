import { getSiteConfig } from "@/lib/config";
import { SiteConfigForm } from "./site-config-form";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoesPage() {
  const config = await getSiteConfig();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
          Configurações
        </p>
        <h1 className="font-display text-3xl text-[var(--color-navy)] md:text-4xl">
          Conteúdo do site
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Altere textos, imagens, redes sociais e comportamentos exibidos no
          site público.
        </p>
      </div>
      <Card>
        <SiteConfigForm initial={config} />
      </Card>
    </div>
  );
}
