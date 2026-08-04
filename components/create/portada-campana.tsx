"use client";

import { PALETAS, paletaDe } from "@/lib/domain/campana";
import { Franja } from "@/components/campaign/franja";
import { moneyCorto } from "@/lib/format";

/**
 * La cara de la campaña. Si el organizador subió una foto, manda la foto.
 * Si no, se arma una portada tipográfica al instante: sin esperas, sin
 * servicios externos, y ninguna campaña queda sin cara.
 */
export function PortadaCampana({
  causa,
  meta,
  foto,
  className,
  paleta,
}: {
  causa: string;
  meta?: number | null;
  foto?: string | null;
  className?: string;
  /** Solo para muestrarios: fuerza una paleta en vez de derivarla del texto. */
  paleta?: number;
}) {
  const texto = causa.trim() || "Tu campaña";
  const p = PALETAS[paleta ?? paletaDe(texto)];

  if (foto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={foto}
        alt={`Foto de ${texto}`}
        className={["aspect-[16/10] w-full rounded-talon object-cover", className]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }

  return (
    <div
      className={[
        "relative flex aspect-[16/10] w-full flex-col justify-between overflow-hidden rounded-talon p-[max(0.75rem,4cqw)] pt-[max(1.1rem,5cqw)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      // El tamaño del texto depende del ancho de la portada, no del viewport:
      // en una grilla de dos columnas, con vw la causa se desbordaba.
      style={{ background: p.fondo, color: p.tinta, containerType: "inline-size" }}
    >
      {/* Orillo: la franja de listas remata la portada por arriba */}
      <Franja className="absolute inset-x-0 top-0" alto={7} />
      {/* Etiqueta sobre bloque de tinta: el gesto del cartel impreso.
          El bloque usa tinta/fondo, el único par con contraste garantizado. */}
      <span
        className="self-start rounded-[3px] px-2 py-1 font-mono uppercase tracking-[0.2em]"
        style={{
          background: p.tinta,
          color: p.fondo,
          fontSize: "clamp(0.5rem, 2.5cqw, 0.62rem)",
        }}
      >
        Estamos juntando para
      </span>

      {/* La causa toma el espacio que sobra y se ancla abajo: así nunca
          invade el pie, sin importar cuán angosta sea la portada. */}
      <div className="flex min-h-0 flex-1 items-center overflow-hidden py-2">
        <p
          className="line-clamp-3 min-w-0 font-display font-extrabold uppercase leading-[1.05] tracking-tight hyphens-auto break-words"
          lang="es"
          style={{ fontSize: "clamp(0.8rem, 7.5cqw, 2rem)", textWrap: "balance" }}
        >
          {texto}
        </p>
      </div>

      <div className="flex shrink-0 items-end justify-between gap-2">
        {meta ? (
          <span
            className="whitespace-nowrap rounded-md px-2 py-1 font-mono font-medium"
            style={{
              background: p.tinta,
              color: p.fondo,
              fontSize: "clamp(0.6rem, 3cqw, 0.875rem)",
            }}
          >
            Meta {moneyCorto(meta)}
          </span>
        ) : (
          <span />
        )}

        {/* Ritmo: módulos en secuencia fija. Estructura, no adorno. */}
        <span className="ritmo" style={{ color: p.acento }} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      </div>
    </div>
  );
}
