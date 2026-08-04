import { NumberStub, type EstadoNumero } from "@/components/raffle/number-stub";
import type { NumberStatus } from "@/types/database";

const MAPA: Record<NumberStatus, EstadoNumero> = {
  available: "disponible",
  reserved: "reservado",
  sold: "vendido",
};

/**
 * Grilla de solo lectura, sin "use client".
 *
 * La versión interactiva recibe una función `estadoDe`, y eso no se puede
 * pasar desde un Server Component: las funciones no cruzan esa frontera.
 * Acá se recibe la lista de números tal como viene de la base y el estado
 * se resuelve del lado del servidor.
 */
export function GrillaLectura({
  cantidad,
  numeros,
}: {
  cantidad: number;
  numeros: { number: number; status: NumberStatus }[];
}) {
  const estados = new Map(numeros.map((n) => [n.number, n.status]));
  const digitos = String(cantidad).length;

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
      {Array.from({ length: cantidad }, (_, i) => i + 1).map((n) => (
        <NumberStub
          key={n}
          numero={n}
          estado={MAPA[estados.get(n) ?? "available"]}
          digitos={digitos}
        />
      ))}
    </div>
  );
}
