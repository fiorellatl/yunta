"use client";

import { useState } from "react";
import { ordinal, premiosDesdeTexto, type Premio } from "@/lib/domain/campana";

export function PremiosEditor({
  premios,
  onCambiar,
}: {
  premios: Premio[];
  onCambiar: (p: Premio[]) => void;
}) {
  const [pegando, setPegando] = useState(false);
  const [texto, setTexto] = useState("");

  const editar = (i: number, parche: Partial<Premio>) =>
    onCambiar(premios.map((p, j) => (j === i ? { ...p, ...parche } : p)));

  const quitar = (i: number) => onCambiar(premios.filter((_, j) => j !== i));

  if (pegando) {
    return (
      <div>
        <label htmlFor="lista" className="text-sm font-medium">
          Un premio por línea
        </label>
        <textarea
          id="lista"
          autoFocus
          rows={6}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={"Una air fryer\nUn juego de ollas\nUna canasta de víveres"}
          className="mt-2 w-full rounded-talon-sm border-2 border-tinta-15 bg-papel-alto p-4 outline-none placeholder:text-tinta-45 focus:border-anil"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              const lista = premiosDesdeTexto(texto);
              if (lista.length) onCambiar(lista);
              setPegando(false);
            }}
            className="rounded-talon-sm bg-anil px-4 py-2 text-sm font-semibold text-white"
          >
            Usar esta lista
          </button>
          <button
            type="button"
            onClick={() => setPegando(false)}
            className="rounded-talon-sm px-4 py-2 text-sm font-medium text-tinta-45 hover:text-tinta"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-2">
        {premios.map((premio, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-talon-sm border-2 border-tinta-15 bg-papel-alto p-2"
          >
            <span className="cifra w-10 shrink-0 text-center text-sm text-anil">
              {ordinal(i + 1)}
            </span>

            <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-md border border-dashed border-tinta-15">
              {premio.fotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={premio.fotoPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg text-tinta-45">
                  ＋
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  if (archivo)
                    editar(i, {
                      fotoPreview: URL.createObjectURL(archivo),
                      fotoArchivo: archivo,
                    });
                }}
              />
              <span className="sr-only">Foto del {ordinal(i + 1)} premio</span>
            </label>

            <input
              value={premio.nombre}
              onChange={(e) => editar(i, { nombre: e.target.value })}
              placeholder={i === 0 ? "Una air fryer de 5 litros" : "Otro premio"}
              aria-label={`${ordinal(i + 1)} premio`}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-tinta-45"
            />

            {premios.length > 1 && (
              <button
                type="button"
                onClick={() => quitar(i)}
                aria-label={`Quitar el ${ordinal(i + 1)} premio`}
                className="shrink-0 px-2 text-tinta-45 hover:text-cochinilla"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() =>
            onCambiar([...premios, { nombre: "", fotoPreview: null, fotoArchivo: null }])
          }
          className="text-sm font-medium text-anil"
        >
          + Agregar otro premio
        </button>
        <button
          type="button"
          onClick={() => setPegando(true)}
          className="text-sm font-medium text-tinta-45 hover:text-tinta"
        >
          Tengo una lista
        </button>
      </div>
    </div>
  );
}
