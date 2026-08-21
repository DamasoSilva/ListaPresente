import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { products } from "@/db/schema";
import { Button, Card } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { AdminProductActions } from "./admin-product-actions";

export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const list = await db.query.products.findMany({
    with: { category: true },
    orderBy: (p, { asc }) => [asc(p.order), asc(p.name)],
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
            Presentes
          </p>
          <h1 className="font-display text-3xl text-[var(--color-navy)] md:text-4xl">
            Produtos
          </h1>
        </div>
        <Link href="/admin/produtos/novo">
          <Button>+ Novo presente</Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <Card>
          <p className="text-center text-[var(--color-ink-soft)]">
            Nenhum produto cadastrado.
          </p>
          <div className="mt-4 text-center">
            <Link href="/admin/produtos/novo">
              <Button>+ Criar primeiro presente</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const available = p.totalQuantity - p.reservedQuantity;
            return (
              <Card key={p.id} padded={false}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl bg-[var(--color-line-soft)]">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">
                      {p.category?.icon || "🎁"}
                    </div>
                  )}
                  {!p.active && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white">
                      Inativo
                    </span>
                  )}
                  {p.featured && (
                    <span className="absolute right-3 top-3 rounded-full bg-[var(--color-rose)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-navy)]">
                      ♥ Destaque
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg text-[var(--color-navy)]">
                        {p.name}
                      </h3>
                      <p className="text-xs text-[var(--color-ink-mute)]">
                        {p.category?.name || "Sem categoria"} ·{" "}
                        {p.price ? formatPrice(p.price) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-[var(--color-line-soft)] p-2">
                      <p className="text-[var(--color-ink-mute)]">Total</p>
                      <p className="font-display text-lg text-[var(--color-navy)]">
                        {p.totalQuantity}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-sage)] p-2">
                      <p className="text-[var(--color-sage-deep)]">Disp.</p>
                      <p className="font-display text-lg text-[var(--color-sage-deep)]">
                        {available}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-rose)] p-2">
                      <p className="text-[var(--color-navy)]">Reserv.</p>
                      <p className="font-display text-lg text-[var(--color-navy)]">
                        {p.reservedQuantity}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <AdminProductActions product={p} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
