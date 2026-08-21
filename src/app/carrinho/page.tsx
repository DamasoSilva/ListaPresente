import { getSiteConfig } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarrinhoCheckout } from "./checkout";

export const dynamic = "force-dynamic";

export default async function CarrinhoPage() {
  const config = await getSiteConfig();
  return (
    <div className="min-h-screen">
      <Header config={config} />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
            Seu carrinho
          </p>
          <h1 className="mt-3 font-display text-3xl text-[var(--color-navy)] md:text-4xl">
            Finalizar reserva de presentes ❤️
          </h1>
        </div>
        <div className="mt-8">
          <CarrinhoCheckout />
        </div>
      </main>
      <Footer config={config} />
    </div>
  );
}
