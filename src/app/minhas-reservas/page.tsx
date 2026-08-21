import { getSiteConfig } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MinhasReservasClient } from "./client";

export const dynamic = "force-dynamic";

export default async function MinhasReservasPage() {
  const config = await getSiteConfig();
  return (
    <div className="min-h-screen">
      <Header config={config} />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <MinhasReservasClient />
      </main>
      <Footer config={config} />
    </div>
  );
}
