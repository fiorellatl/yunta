import Link from "next/link";
import { PALETAS, paletaDe } from "@/lib/domain/campana";

/**
 * La causa nunca se pierde de vista. Acompaña al comprador en cada pantalla
 * —elegir, pagar, confirmar— para que en ningún momento sienta que está
 * comprando números sueltos en vez de apoyando algo.
 */
export function TiraCausa({
  causa,
  slug,
  etiqueta = "Estás apoyando",
}: {
  causa: string;
  slug?: string;
  etiqueta?: string;
}) {
  const p = PALETAS[paletaDe(causa)];

  const contenido = (
    <div
      className="flex items-center gap-3 rounded-talon-sm px-4 py-3"
      style={{ background: p.fondo, color: p.tinta }}
    >
      <span className="ritmo shrink-0" style={{ color: p.acento }} aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      <span className="min-w-0">
        <span
          className="block font-mono text-[0.6rem] uppercase tracking-[0.18em] opacity-80"
          style={{ color: p.tinta }}
        >
          {etiqueta}
        </span>
        <span className="mt-0.5 block truncate font-display text-sm font-bold">
          {causa}
        </span>
      </span>
    </div>
  );

  return slug ? (
    <Link href={`/r/${slug}`} className="block">
      {contenido}
    </Link>
  ) : (
    contenido
  );
}
