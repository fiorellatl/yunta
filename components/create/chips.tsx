"use client";

/** Atajos para no teclear. En celular, la diferencia entre 2 minutos y 5. */
export function Chips<T extends string | number>({
  opciones,
  valor,
  onElegir,
  formato = (v) => String(v),
  etiqueta,
}: {
  opciones: readonly T[];
  valor: T | null;
  onElegir: (v: T) => void;
  formato?: (v: T) => string;
  etiqueta: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={etiqueta}>
      {opciones.map((op) => {
        const activo = valor === op;
        return (
          <button
            key={String(op)}
            type="button"
            onClick={() => onElegir(op)}
            aria-pressed={activo}
            className={[
              "cifra rounded-talon-sm border-2 px-4 py-2 text-sm transition-colors",
              activo
                ? "border-anil bg-anil text-white"
                : "border-tinta-15 bg-papel-alto text-tinta hover:border-anil",
            ].join(" ")}
          >
            {formato(op)}
          </button>
        );
      })}
    </div>
  );
}
