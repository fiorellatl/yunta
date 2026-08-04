"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NumberStub } from "@/components/raffle/number-stub";
import { TiraCausa } from "@/components/campaign/tira-causa";
import { campanaDemo } from "@/lib/mock/campana";
import { formatearTelefono, money } from "@/lib/format";

export default function PagoPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = use(params);
  const router = useRouter();
  const busca = useSearchParams();
  const c = useMemo(() => campanaDemo(slug), [slug]);

  const numeros = (busca.get("n") ?? "")
    .split("-")
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  const total = numeros.length * c.precio;

  const [restante, setRestante] = useState(30 * 60);
  const [comprobante, setComprobante] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setRestante((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(restante / 60)).padStart(2, "0");
  const ss = String(restante % 60).padStart(2, "0");

  async function copiarNumero() {
    try {
      await navigator.clipboard.writeText(c.yape);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* si el navegador no deja, el número está a la vista igual */
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-10 pt-6">
      <TiraCausa causa={c.causa} slug={slug} etiqueta="Tu pago va para" />

      {/* Sus números ya son suyos, por un rato */}
      <div className="mt-4" />
      <div className="rounded-talon border-2 border-tara bg-tara-suave p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Te separamos estos números</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {numeros.map((n) => (
                <span key={n} className="w-11">
                  <NumberStub numero={n} estado="reservado" digitos={String(c.cantidad).length} />
                </span>
              ))}
            </div>
          </div>
          <span className="shrink-0 text-right">
            <span className="block cifra text-3xl">
              {mm}:{ss}
            </span>
            <span className="block text-xs text-tinta-70">para pagar</span>
          </span>
        </div>
      </div>

      <h1 className="mt-8 text-[clamp(1.8rem,6vw,2.4rem)]">Yapea {money(total)}</h1>
      <p className="mt-3 leading-relaxed text-tinta-70">
        El dinero le llega directo a {c.titular}, que organiza esta campaña.
      </p>

      {/* Paso 1: pagar */}
      <div className="mt-6 rounded-talon border border-tinta-15 bg-papel-alto p-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-tinta-45">
          Yape o Plin
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="cifra text-3xl">
            {formatearTelefono(c.yape)}
          </span>
          <button
            type="button"
            onClick={copiarNumero}
            className="shrink-0 rounded-talon-sm border-2 border-tinta-15 px-3 py-2 text-sm font-medium text-anil hover:border-anil"
          >
            {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p className="mt-3 text-sm text-tinta-70">A nombre de {c.titular}</p>

        <div className="linea-corte my-4" />

        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-tinta-70">Tus números</dt>
            <dd className="font-mono">{numeros.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-tinta-70">Precio por número</dt>
            <dd className="font-mono">{money(c.precio)}</dd>
          </div>
          <div className="flex justify-between pt-1">
            <dt className="font-medium">Total a yapear</dt>
            <dd className="cifra text-xl">{money(total)}</dd>
          </div>
        </dl>
      </div>

      {/* Paso 2: mostrar el comprobante */}
      <h2 className="mt-8 text-xl">Ahora sube tu comprobante</h2>
      <p className="mt-2 text-sm leading-relaxed text-tinta-70">
        La captura de la operación. {c.organizador} la revisa y tus números quedan
        confirmados.
      </p>

      <label className="mt-4 flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-talon border-2 border-dashed border-tinta-15 bg-papel-alto hover:border-anil">
        {comprobante ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={comprobante} alt="Tu comprobante" className="h-full w-full object-contain" />
        ) : (
          <span className="text-center text-tinta-45">
            <span className="block text-3xl">＋</span>
            <span className="mt-1 block text-sm">Subir la captura del pago</span>
          </span>
        )}
        <input
          type="file"
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (archivo) setComprobante(URL.createObjectURL(archivo));
          }}
        />
      </label>

      <Button
        tamano="lg"
        className="mt-5 w-full"
        disabled={!comprobante || enviando}
        onClick={() => {
          setEnviando(true);
          router.push(`/o/${token}?n=${numeros.join("-")}`);
        }}
      >
        {enviando ? "Enviando…" : "Enviar comprobante"}
      </Button>

      <p className="mt-4 text-center text-xs leading-relaxed text-tinta-45">
        Tu comprobante solo lo ve {c.organizador}. Nadie más tiene acceso.
      </p>
    </main>
  );
}
