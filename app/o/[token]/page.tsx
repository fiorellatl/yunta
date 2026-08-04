"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TicketTalon } from "@/components/campaign/ticket-talon";
import { BarraMeta } from "@/components/campaign/barra-meta";
import { TiraCausa } from "@/components/campaign/tira-causa";
import { campanaDemo, recaudado } from "@/lib/mock/campana";
import { fechaLarga, money } from "@/lib/format";

const ETAPAS = [
  { clave: "separado", titulo: "Separaste tus números" },
  { clave: "revisando", titulo: "Estamos verificando tu pago" },
  { clave: "confirmado", titulo: "Tus números quedaron confirmados" },
] as const;

export default function EstadoOrdenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const busca = useSearchParams();
  const c = useMemo(() => campanaDemo(), []);

  const numeros = (busca.get("n") ?? "")
    .split("-")
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  const total = numeros.length * c.precio;

  const [etapa, setEtapa] = useState(1);
  const [origen, setOrigen] = useState("");
  const [copiado, setCopiado] = useState(false);
  useEffect(() => setOrigen(window.location.origin), []);

  const enlaceOrden = `${origen}/o/${token}`;

  async function copiarOrden() {
    try {
      await navigator.clipboard.writeText(enlaceOrden);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* el enlace está a la vista: se puede seleccionar a mano */
    }
  }

  const enlace = `${origen}/r/${c.slug}`;
  const mensaje = `Acabo de apoyar ${c.causa.toLowerCase()} con ${numeros.length} ${numeros.length === 1 ? "número" : "números"}. Si puedes, súmate tú también: ${enlace}`;
  const codigo = `YT-${token.slice(0, 4).toUpperCase()}`;

  return (
    <main className="mx-auto max-w-md px-5 pb-12 pt-8">
      <span className="sello animate-sello inline-block text-chilca">
        Ya eres parte
      </span>

      <h1 className="mt-5 text-[clamp(1.9rem,6.5vw,2.6rem)]">
        Gracias. Ya estás apoyando {c.causa.toLowerCase()}.
      </h1>
      <p className="mt-3 leading-relaxed text-tinta-70">
        {c.organizador} va a revisar tu comprobante. Te avisamos por WhatsApp apenas
        lo confirme.
      </p>

      <div className="mt-6">
        <TiraCausa causa={c.causa} slug={c.slug} etiqueta="Tu aporte va para" />
      </div>

      {/* Lo suyo, primero */}
      <section className="mt-8 rounded-talon border border-tinta-15 bg-papel-alto p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg">Tus números</h2>
          <span className="font-mono text-xs text-tinta-45">{codigo}</span>
        </div>

        <div className="mt-4 space-y-2">
          {numeros.map((n) => (
            <TicketTalon
              key={n}
              numero={n}
              digitos={String(c.cantidad).length}
              codigo={codigo}
              confirmado={etapa >= 2}
            />
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-tinta-45">
          Tu mitad se queda contigo. La otra entra al ánfora el día del sorteo.
        </p>

        <p className="mt-4 text-sm text-tinta-70">
          Aportaste <span className="cifra">{money(total)}</span> · sorteo
          el {fechaLarga(new Date(`${c.fechaSorteo}T12:00:00`))}
        </p>
      </section>

      {/* Estado, en lenguaje de persona */}
      <ol className="mt-8 space-y-4">
        {ETAPAS.map((e, i) => {
          const hecha = i < etapa;
          const activa = i === etapa;
          return (
            <li key={e.clave} className="flex gap-4">
              <span
                className={[
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                  hecha
                    ? "border-chilca bg-chilca text-white"
                    : activa
                      ? "border-tara bg-tara-suave text-tinta"
                      : "border-tinta-15 text-tinta-45",
                ].join(" ")}
              >
                {hecha ? "✓" : i + 1}
              </span>
              <div className="min-w-0">
                <p className={hecha || activa ? "font-medium" : "text-tinta-45"}>
                  {e.titulo}
                </p>
                {activa && (
                  <p className="mt-1 text-sm text-tinta-70">
                    Suele tomar menos de una hora. No necesitas hacer nada más.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* El valor que se devuelve: ver que su aporte movió el marcador */}
      <section className="mt-9 rounded-talon bg-tinta px-6 py-6 text-papel">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-tara">
          Cómo va la campaña
        </p>
        <div className="mt-4">
          <BarraMeta
            recaudado={recaudado(c) + total}
            meta={c.meta}
            maximo={c.precio * c.cantidad}
            vendidos={c.vendidos.length + numeros.length}
            cantidad={c.cantidad}
            tono="oscuro"
          />
        </div>
        <p className="mt-4 text-sm text-tinta-15">
          Tu aporte ya está contado acá.
        </p>
      </section>

      {/* El comprador también puede mover la campaña */}
      <section className="mt-8">
        <h2 className="text-xl">¿Conoces a alguien que también quiera ayudar?</h2>
        <p className="mt-2 text-sm leading-relaxed text-tinta-70">
          Compartirlo cuesta menos que comprar, y a veces sirve más.
        </p>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-talon-sm border-2 border-anil text-sm font-semibold text-anil hover:bg-anil-suave"
        >
          Compartir la campaña
        </a>
      </section>

      {/* "Guarda este link" no decía cuál: ahora está a la vista y se copia. */}
      <div className="mt-8 rounded-talon border-2 border-tinta-15 bg-papel-alto p-4">
        <p className="text-sm font-medium">Para volver a ver tus números</p>
        <p className="mt-1 text-sm leading-relaxed text-tinta-70">
          Esta página es tuya. Guárdala y vuelve cuando quieras a ver si tu pago ya
          fue confirmado.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-talon-sm bg-papel px-3 py-2">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-tinta-70">
            {enlaceOrden}
          </span>
          <button
            type="button"
            onClick={copiarOrden}
            className="shrink-0 text-sm font-medium text-anil"
          >
            {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-6 text-sm">
        <Link href={`/r/${c.slug}`} className="font-medium text-tinta-45 hover:text-tinta">
          Ver la campaña
        </Link>
        {/* Atajo solo para revisar el diseño de los tres estados */}
        <button
          type="button"
          onClick={() => setEtapa((e) => (e + 1) % 3)}
          className="font-mono text-tinta-15 hover:text-tinta-45"
        >
          ver otro estado
        </button>
      </div>
    </main>
  );
}
