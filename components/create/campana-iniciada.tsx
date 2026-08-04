"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PortadaCampana } from "@/components/create/portada-campana";
import { DescargarAfiche } from "@/components/campaign/descargar-afiche";
import { diasHasta, fechaLarga, money, moneyCorto } from "@/lib/format";

/**
 * Publicar no es el final: es el momento de mandarle la campaña a alguien.
 * Por eso la pantalla no termina en "copia tu link" sino en
 * "¿a quién se lo mandas primero?".
 */
export function CampanaIniciada({
  slug,
  causa,
  meta,
  precio,
  cantidad,
  premios,
  fechaSorteo,
  portadaFoto,
  portadaPaleta,
}: {
  slug: string;
  causa: string;
  meta: number | null;
  precio: number;
  cantidad: number;
  premios: number;
  fechaSorteo: string;
  portadaFoto: string | null;
  portadaPaleta?: number | null;
}) {
  const [copiado, setCopiado] = useState(false);
  const [fallo, setFallo] = useState(false);
  const [enviados, setEnviados] = useState<number[]>([]);

  // El origen solo se conoce en el navegador; sin esto el link saldría relativo.
  const [origen, setOrigen] = useState(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  useEffect(() => setOrigen(window.location.origin), []);

  const enlace = `${origen}/r/${slug}`;
  const dias = diasHasta(fechaSorteo);
  const maximo = precio * cantidad;

  const DESTINATARIOS = [
    {
      titulo: "A tu familia",
      pista: "Los primeros números siempre salen de casa.",
      mensaje: `Hola 👋 Estamos juntando para ${causa}. Armé una rifa: cada número cuesta ${money(precio)} y el sorteo es el ${fechaLarga(new Date(`${fechaSorteo}T12:00:00`))}. ¿Me apoyas con uno? ${enlace}`,
    },
    {
      titulo: "A tu grupo del colegio, trabajo o barrio",
      pista: "Un grupo mueve más números que diez mensajes sueltos.",
      mensaje: `Hola a todos 👋 Estamos juntando para ${causa} y armamos una rifa. Números a ${money(precio)}, ${premios > 1 ? `${premios} premios` : "premio"} y sorteo el ${fechaLarga(new Date(`${fechaSorteo}T12:00:00`))}. Acá pueden elegir el suyo: ${enlace}`,
    },
    {
      titulo: "A los 3 amigos que más comparten",
      pista: "No que compren: que lo reenvíen.",
      mensaje: `Oye, estoy juntando para ${causa}. ¿Me haces el favor de reenviar esto a quien creas que puede apoyar? ${enlace}`,
    },
  ];

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setFallo(true);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-12 pt-8">
      <span className="sello animate-sello inline-block text-chilca">En marcha</span>

      <h1 className="mt-5 text-[clamp(2rem,7vw,2.75rem)]">
        Tu campaña ya está en marcha.
      </h1>

      <div className="mt-6">
        <PortadaCampana
          causa={causa}
          meta={meta}
          foto={portadaFoto}
          paleta={portadaPaleta ?? undefined}
        />
      </div>

      {/* El marcador: arranca en cero, y eso es lo que da ganas de compartir */}
      <div className="mt-4 rounded-talon bg-tinta px-6 py-5 text-papel">
        <div className="flex items-baseline justify-between">
          <span className="cifra text-4xl">S/ 0</span>
          <span className="cifra text-sm text-tinta-15">
            {meta ? `de ${moneyCorto(meta)}` : `hasta ${moneyCorto(maximo)}`}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-tinta-70">
          <div className="h-full w-0 rounded-full bg-chilca" />
        </div>
        <p className="mt-3 text-sm text-tinta-15">
          {cantidad} números disponibles · sorteo{" "}
          {dias === 0 ? "hoy" : dias === 1 ? "mañana" : `en ${dias} días`}
        </p>
      </div>

      {/* El afiche, antes de pedirle que comparta: es lo que va a mandar */}
      <section className="mt-8 rounded-talon border-2 border-tinta-15 bg-papel-alto p-5">
        <DescargarAfiche slug={slug} causa={causa} />
      </section>

      {/* El verdadero primer paso */}
      <section className="mt-9">
        <h2 className="text-2xl">¿A quién se lo mandas primero?</h2>
        <p className="mt-2 leading-relaxed text-tinta-70">
          Tu campaña empieza cuando la ve la primera persona, no cuando se publica.
        </p>

        <ul className="mt-5 space-y-3">
          {DESTINATARIOS.map((d, i) => {
            const listo = enviados.includes(i);
            return (
              <li
                key={d.titulo}
                className={[
                  "rounded-talon border-2 p-4 transition-colors",
                  listo ? "border-chilca bg-chilca-suave" : "border-tinta-15 bg-papel-alto",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{d.titulo}</p>
                    <p className="mt-1 text-sm text-tinta-70">{d.pista}</p>
                  </div>
                  {listo && (
                    <span className="sello shrink-0 text-chilca text-[0.6rem]">Enviado</span>
                  )}
                </div>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(d.mensaje)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setEnviados((e) => (e.includes(i) ? e : [...e, i]))}
                  className={[
                    "mt-3 flex h-11 w-full items-center justify-center rounded-talon-sm text-sm font-semibold transition-colors",
                    listo
                      ? "border-2 border-chilca text-chilca"
                      : "bg-anil text-white shadow-[0_2px_0_0_var(--anil-oscuro)] hover:bg-anil-oscuro",
                  ].join(" ")}
                >
                  {listo ? "Mandar otra vez" : "Mandar por WhatsApp"}
                </a>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-center text-sm text-tinta-45">
          {enviados.length === DESTINATARIOS.length
            ? "Ya la mandaste a los tres. Ahora te toca esperar los pagos."
            : `${enviados.length} de ${DESTINATARIOS.length} enviados`}
        </p>
      </section>

      <div className="mt-8">
        <div className="flex items-center gap-2 rounded-talon-sm border-2 border-tinta-15 bg-papel-alto px-4 py-3">
          <span className="min-w-0 flex-1 truncate font-mono text-sm text-tinta-70">
            {enlace}
          </span>
          <button
            type="button"
            onClick={copiar}
            className="shrink-0 text-sm font-medium text-anil"
          >
            {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>
        {fallo && (
          <p className="mt-2 text-sm text-tinta-45">
            Tu navegador no dejó copiarlo. Selecciona el enlace y cópialo a mano.
          </p>
        )}
      </div>

      <p className="mt-6 text-sm leading-relaxed text-tinta-70">
        Cuando alguien pague, te avisamos para que revises el comprobante y el número
        quede suyo.
      </p>

      <Link
        href="/app"
        className="mt-6 block text-center text-sm font-medium text-tinta-45 hover:text-tinta"
      >
        Ir a mi campaña
      </Link>
    </main>
  );
}
