"use client";

import { useState, useTransition } from "react";
import { NumberStub } from "@/components/raffle/number-stub";
import { Button } from "@/components/ui/button";
import { aprobarOrden, rechazarOrden, verComprobante } from "@/lib/actions/orders";
import { formatearTelefono, money } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/database";

type OrdenConNumeros = Order & { numeros: number[] };

const ETIQUETA: Record<OrderStatus, { texto: string; tono: string }> = {
  in_review: { texto: "Por revisar", tono: "text-tara" },
  pending_payment: { texto: "Sin pagar", tono: "text-tinta-45" },
  approved: { texto: "Aprobado", tono: "text-chilca" },
  rejected: { texto: "Rechazado", tono: "text-cochinilla" },
  expired: { texto: "Vencido", tono: "text-tinta-45" },
  cancelled: { texto: "Cancelado", tono: "text-tinta-45" },
};

export function BandejaOrdenes({
  ordenes,
  campanaId,
  digitos,
}: {
  ordenes: OrdenConNumeros[];
  campanaId: string;
  digitos: number;
}) {
  if (!ordenes.length) {
    return (
      <p className="rounded-talon border border-dashed border-tinta-15 p-6 text-center text-sm text-tinta-70">
        Todavía nadie ha comprado. Cuando alguien pague, su comprobante aparece acá.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {ordenes.map((o) => (
        <Fila key={o.id} orden={o} campanaId={campanaId} digitos={digitos} />
      ))}
    </ul>
  );
}

function Fila({
  orden,
  campanaId,
  digitos,
}: {
  orden: OrdenConNumeros;
  campanaId: string;
  digitos: number;
}) {
  const [pendiente, iniciar] = useTransition();
  const [comprobante, setComprobante] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const etiqueta = ETIQUETA[orden.status];
  const porRevisar = orden.status === "in_review";

  return (
    <li
      className={[
        "rounded-talon border-2 bg-papel-alto p-4",
        porRevisar ? "border-tara" : "border-tinta-15",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{orden.buyer_name}</p>
          <p className="cifra mt-0.5 text-sm text-tinta-70">
            {formatearTelefono(orden.buyer_phone)}
          </p>
        </div>
        <span className={`sello shrink-0 text-[0.6rem] ${etiqueta.tono}`}>
          {etiqueta.texto}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {orden.numeros.map((n) => (
          <span key={n} className="w-11">
            <NumberStub
              numero={n}
              estado={orden.status === "approved" ? "vendido" : "reservado"}
              digitos={digitos}
            />
          </span>
        ))}
        <span className="cifra ml-auto text-xl">{money(Number(orden.total_amount))}</span>
      </div>

      {comprobante && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={comprobante}
          alt={`Comprobante de ${orden.buyer_name}`}
          className="mt-3 max-h-80 w-full rounded-talon-sm border border-tinta-15 object-contain"
        />
      )}

      {error && <p className="mt-3 text-sm text-cochinilla">{error}</p>}

      {porRevisar && (
        <div className="mt-4 flex flex-wrap gap-2">
          {orden.proof_path && !comprobante && (
            <Button
              variante="secundario"
              onClick={() =>
                iniciar(async () => {
                  const url = await verComprobante(orden.id);
                  if (url) setComprobante(url);
                  else setError("No pudimos abrir el comprobante.");
                })
              }
              disabled={pendiente}
            >
              Ver comprobante
            </Button>
          )}

          <Button
            onClick={() =>
              iniciar(async () => {
                const r = await aprobarOrden(orden.id, campanaId);
                if (!r.ok) setError(r.mensaje);
              })
            }
            disabled={pendiente}
          >
            Sí, le llegó el pago
          </Button>

          <Button
            variante="fantasma"
            onClick={() =>
              iniciar(async () => {
                const r = await rechazarOrden(orden.id, campanaId, "El pago no llegó");
                if (!r.ok) setError(r.mensaje);
              })
            }
            disabled={pendiente}
          >
            Rechazar
          </Button>
        </div>
      )}
    </li>
  );
}
