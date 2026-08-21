import { db } from "@/db";
import { products, reservations } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card } from "@/components/ui";
import { formatDateTime, formatPhone, truncate } from "@/lib/utils";
import { StatusPill } from "../page";
import { ReservationActions } from "./reservation-actions";

export const dynamic = "force-dynamic";

export default async function AdminReservasPage() {
  const list = await db.query.reservations.findMany({
    orderBy: (r, { desc }) => desc(r.createdAt),
    with: { product: true },
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
          Reservas
        </p>
        <h1 className="font-display text-3xl text-[var(--color-navy)] md:text-4xl">
          Reservas de convidados
        </h1>
      </div>

      {list.length === 0 ? (
        <Card>
          <p className="text-center text-[var(--color-ink-soft)]">
            Nenhuma reserva registrada.
          </p>
        </Card>
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line-soft)] text-left text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Convidado</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Presente</th>
                  <th className="px-4 py-3">Qtd</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--color-line-soft)] last:border-0"
                  >
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.guestName}</p>
                      <p className="text-xs text-[var(--color-ink-mute)]">
                        {formatPhone(r.guestPhone)}
                      </p>
                      {r.message && (
                        <p className="mt-1 max-w-xs truncate text-xs italic text-[var(--color-ink-soft)]">
                          &ldquo;{truncate(r.message, 80)}&rdquo;
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">
                      {r.guestEmail}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">
                      {truncate(r.product?.name || "—", 40)}
                    </td>
                    <td className="px-4 py-3">{r.quantity}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ReservationActions reservation={r} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
