import { db } from "@/db";
import {
  categories,
  externalProducts,
  products,
  reservations,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { formatDateTime, formatPhone, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    productStats,
    reservationStats,
    categoryCount,
    externalCount,
  ] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) filter (where ${products.active} = true)`,
        totalQty: sql<number>`coalesce(sum(${products.totalQuantity}), 0)`,
        reservedQty: sql<number>`coalesce(sum(${products.reservedQuantity}), 0)`,
        fullyReserved: sql<number>`count(*) filter (where ${products.active} = true and ${products.reservedQuantity} >= ${products.totalQuantity})`,
        available: sql<number>`count(*) filter (where ${products.active} = true and ${products.reservedQuantity} < ${products.totalQuantity})`,
      })
      .from(products),
    db
      .select({
        total: sql<number>`count(*)`,
        reservada: sql<number>`count(*) filter (where ${reservations.status} = 'reservada')`,
        entregue: sql<number>`count(*) filter (where ${reservations.status} = 'entregue')`,
        cancelada: sql<number>`count(*) filter (where ${reservations.status} = 'cancelada')`,
        units: sql<number>`coalesce(sum(${reservations.quantity}) filter (where ${reservations.status} in ('reservada','confirmada')), 0)`,
      })
      .from(reservations),
    db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(eq(categories.active, true)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(externalProducts)
      .where(eq(externalProducts.active, true)),
  ]);

  const p = productStats[0] || {};
  const r = reservationStats[0] || {};
  const recent = await db.query.reservations.findMany({
    orderBy: (r, { desc }) => desc(r.createdAt),
    with: { product: true },
    limit: 8,
  });

  const totalProducts = Number(p.total || 0);
  const availableProducts = Number(p.available || 0);
  const fullyReserved = Number(p.fullyReserved || 0);
  const totalQty = Number(p.totalQty || 0);
  const reservedQty = Number(p.reservedQty || 0);
  const totalReservations = Number(r.total || 0);
  const pendingRes = Number(r.reservada || 0);
  const deliveredRes = Number(r.entregue || 0);
  const cancelledRes = Number(r.cancelada || 0);
  const reservedUnits = Number(r.units || 0);
  const extCount = Number(externalCount[0]?.count || 0);
  const catCount = Number(categoryCount[0]?.count || 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
            Dashboard
          </p>
          <h1 className="font-display text-3xl text-[var(--color-navy)] md:text-4xl">
            Visão geral
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/produtos/novo">
            <Button>+ Novo presente</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total de presentes" value={totalProducts} tone="navy" />
        <StatCard label="Disponíveis" value={availableProducts} tone="sage" />
        <StatCard label="Já escolhidos" value={fullyReserved} tone="rose" />
        <StatCard label="Reservas" value={totalReservations} tone="sand" />
        <StatCard label="Unidades reservadas" value={reservedUnits} />
        <StatCard label="Pendentes" value={pendingRes} />
        <StatCard label="Entregues" value={deliveredRes} />
        <StatCard label="Canceladas" value={cancelledRes} />
        <StatCard label="Quantidade total" value={totalQty} />
        <StatCard label="Quantidade reservada" value={reservedQty} />
        <StatCard label="Categorias ativas" value={catCount} />
        <StatCard label="Indicações ativas" value={extCount} />
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-[var(--color-navy)]">
            Últimas reservas
          </h2>
          <Link
            href="/admin/reservas"
            className="text-sm text-[var(--color-navy)] underline-offset-4 hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            Nenhuma reserva ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line-soft)] text-left text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Convidado</th>
                  <th className="py-2 pr-4">Presente</th>
                  <th className="py-2 pr-4">Qtd</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((res) => (
                  <tr
                    key={res.id}
                    className="border-b border-[var(--color-line-soft)] last:border-0"
                  >
                    <td className="py-2 pr-4 text-[var(--color-ink-soft)]">
                      {formatDateTime(res.createdAt)}
                    </td>
                    <td className="py-2 pr-4">
                      <p className="font-medium">{res.guestName}</p>
                      <p className="text-xs text-[var(--color-ink-mute)]">
                        {formatPhone(res.guestPhone)}
                      </p>
                      <p className="text-xs text-[var(--color-ink-mute)]">
                        {res.guestEmail}
                      </p>
                    </td>
                    <td className="py-2 pr-4 text-[var(--color-ink-soft)]">
                      {truncate(res.product?.name || "—", 40)}
                    </td>
                    <td className="py-2 pr-4">{res.quantity}</td>
                    <td className="py-2 pr-4">
                      <StatusPill status={res.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "navy" | "sage" | "rose" | "sand";
}) {
  const tones = {
    navy: "bg-[var(--color-navy)] text-white",
    sage: "bg-[var(--color-sage)] text-[var(--color-sage-deep)]",
    rose: "bg-[var(--color-rose)] text-[var(--color-navy)]",
    sand: "bg-[var(--color-sand)] text-[var(--color-sand-deep)]",
  };
  const toneClass = tone ? tones[tone] : "bg-[var(--color-line-soft)] text-[var(--color-ink-soft)]";
  return (
    <div className="rounded-2xl bg-white p-4 card-shadow-soft">
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span
          className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-sm font-semibold ${toneClass}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    reservada: "bg-[var(--color-sand)] text-[var(--color-sand-deep)]",
    confirmada: "bg-[var(--color-sky)] text-[var(--color-navy)]",
    entregue: "bg-[var(--color-sage)] text-[var(--color-sage-deep)]",
    cancelada: "bg-[var(--color-rose)] text-[var(--color-navy)]",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        map[status] || map.reservada
      }`}
    >
      {status}
    </span>
  );
}
