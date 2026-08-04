"use client";

import { NumberStub, type EstadoNumero } from "@/components/raffle/number-stub";

/**
 * La grilla. Se usa igual en la vista del organizador (solo lectura) y en
 * la del comprador (selección), para que el estado de un número nunca se
 * calcule de dos maneras distintas.
 */
export function GrillaNumeros({
  cantidad,
  estadoDe,
  seleccionados = [],
  onAlternar,
  maximo,
}: {
  cantidad: number;
  estadoDe: (n: number) => EstadoNumero;
  seleccionados?: number[];
  onAlternar?: (n: number) => void;
  maximo?: number;
}) {
  const digitos = String(cantidad).length;
  const lleno = !!maximo && seleccionados.length >= maximo;

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
      {Array.from({ length: cantidad }, (_, i) => i + 1).map((n) => {
        const estado = estadoDe(n);
        const elegido = seleccionados.includes(n);
        const libre = estado === "disponible";
        const bloqueado = !libre || (lleno && !elegido);

        if (!onAlternar) {
          return <NumberStub key={n} numero={n} estado={estado} digitos={digitos} />;
        }

        return (
          <button
            key={n}
            type="button"
            disabled={bloqueado}
            aria-pressed={elegido}
            aria-label={`Número ${n}${libre ? "" : ", ya no está libre"}`}
            onClick={() => onAlternar(n)}
            className="disabled:cursor-not-allowed disabled:opacity-55"
          >
            <NumberStub
              numero={n}
              estado={estado}
              seleccionado={elegido}
              digitos={digitos}
            />
          </button>
        );
      })}
    </div>
  );
}
