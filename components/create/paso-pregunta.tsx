"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * El marco de una pregunta. Todas las pantallas de creación se ven igual:
 * avance arriba, una pregunta, una respuesta, un botón. Nada más.
 */
export function PasoPregunta({
  indice,
  total,
  pregunta,
  ayuda,
  children,
  eco,
  puedeAvanzar,
  textoAvanzar = "Siguiente",
  onAvanzar,
  onAtras,
  onSaltar,
}: {
  indice: number;
  total: number;
  pregunta: string;
  ayuda?: string;
  children: ReactNode;
  eco?: ReactNode;
  puedeAvanzar: boolean;
  textoAvanzar?: string;
  onAvanzar: () => void;
  onAtras?: () => void;
  onSaltar?: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (puedeAvanzar) onAvanzar();
      }}
      className="flex min-h-dvh flex-col"
    >
      <header className="px-5 pt-5">
        <div className="flex items-center gap-3">
          {onAtras ? (
            <button
              type="button"
              onClick={onAtras}
              className="-ml-2 flex h-9 w-9 items-center justify-center rounded-talon-sm text-tinta-45 hover:bg-anil-suave hover:text-tinta"
              aria-label="Volver a la pregunta anterior"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="h-9 w-9" />
          )}

          {/* El avance se lee como talones que se van llenando */}
          <div className="flex flex-1 gap-1" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={[
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  i < indice ? "bg-anil" : i === indice ? "bg-anil/40" : "bg-tinta-15",
                ].join(" ")}
              />
            ))}
          </div>

          <span className="font-mono text-xs text-tinta-45 tabular-nums">
            {indice + 1}/{total}
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <h1 className="text-[clamp(1.9rem,7vw,2.6rem)]">{pregunta}</h1>
        {ayuda && <p className="mt-3 leading-relaxed text-tinta-70">{ayuda}</p>}

        <div className="mt-8">{children}</div>

        {eco && (
          <div className="mt-7 rounded-talon bg-anil-suave px-5 py-4 text-tinta">
            {eco}
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 mx-auto w-full max-w-md bg-papel/90 px-5 pb-6 pt-3 backdrop-blur">
        <Button type="submit" tamano="lg" className="w-full" disabled={!puedeAvanzar}>
          {textoAvanzar}
        </Button>
        {onSaltar && (
          <button
            type="button"
            onClick={onSaltar}
            className="mt-3 w-full text-sm font-medium text-tinta-45 hover:text-tinta"
          >
            Saltar por ahora
          </button>
        )}
      </footer>
    </form>
  );
}
