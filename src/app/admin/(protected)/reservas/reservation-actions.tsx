"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteReservation,
  updateReservationStatus,
} from "@/lib/actions";
import { Button, Select } from "@/components/ui";
import type { Reservation } from "@/db/schema";

const STATUSES = ["reservada", "confirmada", "entregue", "cancelada"] as const;

export function ReservationActions({
  reservation,
}: {
  reservation: Reservation;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onStatus = (status: (typeof STATUSES)[number]) => {
    setError(null);
    startTransition(async () => {
      const res = await updateReservationStatus(reservation.id, status);
      if ("error" in res) setError(res.error);
      else router.refresh();
    });
  };

  const onDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteReservation(reservation.id);
      if ("error" in res) {
        setError(res.error);
        setConfirmDelete(false);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="inline-flex flex-col items-end gap-2">
      {error && (
        <p className="rounded bg-[#fdecec] px-2 py-1 text-[11px] text-[#b85c5c]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <Select
          value={reservation.status}
          onChange={(e) =>
            onStatus(e.target.value as (typeof STATUSES)[number])
          }
          className="w-auto text-xs py-1.5 px-2"
          disabled={pending}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        {!confirmDelete ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-[#b85c5c]"
          >
            Excluir
          </Button>
        ) : (
          <>
            <Button
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={onDelete}
              className="text-xs"
            >
              Sim
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              className="text-xs"
            >
              Não
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
