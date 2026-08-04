import { moneyCorto } from "@/lib/format";

/**
 * El marcador de la campaña. Es lo primero que mira alguien que ya apoyó
 * y lo que decide a quien todavía no: una causa a mitad de camino
 * convence más que una vacía.
 */
export function BarraMeta({
  recaudado,
  meta,
  maximo,
  vendidos,
  cantidad,
  tono = "claro",
}: {
  recaudado: number;
  meta: number | null;
  maximo: number;
  vendidos: number;
  cantidad: number;
  tono?: "claro" | "oscuro";
}) {
  const referencia = meta ?? maximo;
  const avance = Math.min(100, Math.round((recaudado / referencia) * 100));
  const oscuro = tono === "oscuro";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="cifra text-4xl">
          {moneyCorto(recaudado)}
        </span>
        <span className={`font-mono text-sm ${oscuro ? "text-tinta-15" : "text-tinta-45"}`}>
          {meta ? `de ${moneyCorto(meta)}` : `hasta ${moneyCorto(maximo)}`}
        </span>
      </div>

      <div
        className={`mt-3 h-2.5 overflow-hidden rounded-full ${oscuro ? "bg-tinta-70" : "bg-tinta-15"}`}
        role="progressbar"
        aria-valuenow={avance}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Avance de la campaña"
      >
        <div
          className="h-full rounded-full bg-chilca transition-[width] duration-700"
          style={{ width: `${Math.max(avance, recaudado > 0 ? 3 : 0)}%` }}
        />
      </div>

      <p className={`mt-3 text-sm ${oscuro ? "text-tinta-15" : "text-tinta-70"}`}>
        <span className="font-medium">{avance}%</span> de la meta ·{" "}
        {cantidad - vendidos} números todavía libres
      </p>
    </div>
  );
}
