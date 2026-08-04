"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GrillaNumeros } from "@/components/campaign/grilla-numeros";
import { TiraCausa } from "@/components/campaign/tira-causa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { campanaDemo, estadoNumero, recaudado } from "@/lib/mock/campana";
import { formatearTelefono, money, moneyCorto, telefonoValido } from "@/lib/format";

const MAXIMO = 20;

export default function ComprarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const c = useMemo(() => campanaDemo(slug), [slug]);

  const [etapa, setEtapa] = useState<"elegir" | "datos">("elegir");
  const [elegidos, setElegidos] = useState<number[]>([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const total = elegidos.length * c.precio;
  const referencia = c.meta ?? c.precio * c.cantidad;
  const aporte = total > 0 ? Math.max(1, Math.round((total / referencia) * 100)) : 0;
  const faltaParaMeta = Math.max(0, referencia - recaudado(c) - total);

  function alternar(n: number) {
    setElegidos((e) => (e.includes(n) ? e.filter((x) => x !== n) : [...e, n]));
  }

  function sorprendeme() {
    const libres = Array.from({ length: c.cantidad }, (_, i) => i + 1).filter(
      (n) => estadoNumero(c, n) === "disponible" && !elegidos.includes(n),
    );
    if (libres.length) {
      setElegidos((e) => [...e, libres[Math.floor(Math.random() * libres.length)]]);
    }
  }

  if (etapa === "datos") {
    const listo = nombre.trim().length >= 3 && telefonoValido(telefono);
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-6">
        <button
          type="button"
          onClick={() => setEtapa("elegir")}
          className="self-start text-sm font-medium text-tinta-45 hover:text-tinta"
        >
          ← Cambiar mis números
        </button>

        <div className="mt-5">
          <TiraCausa causa={c.causa} />
        </div>

        <h1 className="mt-6 text-[clamp(1.8rem,6vw,2.4rem)]">
          ¿A nombre de quién van tus números?
        </h1>
        <p className="mt-3 leading-relaxed text-tinta-70">
          Solo para avisarte cuando {c.organizador} confirme tu pago, y para
          encontrarte si ganas.
        </p>

        <form
          className="mt-8 flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (!listo) return;
            const token = Math.random().toString(36).slice(2, 10);
            const numeros = elegidos.sort((a, b) => a - b).join("-");
            router.push(`/r/${slug}/pago/${token}?n=${numeros}`);
          }}
        >
          <label className="block">
            <span className="text-sm font-medium">Tu nombre</span>
            <Input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Luis Ramos"
              autoComplete="name"
              className="mt-2"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium">Tu WhatsApp</span>
            <Input
              type="tel"
              inputMode="numeric"
              value={formatearTelefono(telefono)}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="987 654 321"
              className="mt-2 font-mono tabular-nums"
            />
          </label>

          <div className="mt-7 rounded-talon bg-anil-suave px-5 py-4">
            <p className="text-sm text-tinta-70">Tus números</p>
            <p className="mt-1 font-mono text-lg">
              {elegidos.sort((a, b) => a - b).join(" · ")}
            </p>
            <p className="mt-2 font-mono text-2xl font-medium">{money(total)}</p>
          </div>

          <div className="mt-auto pt-8">
            <Button type="submit" tamano="lg" className="w-full" disabled={!listo}>
              Sepárame estos números
            </Button>
            <p className="mt-3 text-center text-xs text-tinta-45">
              Te los guardamos 30 minutos para que hagas el pago.
            </p>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-36 pt-6">
      <Link
        href={`/r/${slug}`}
        className="text-sm font-medium text-tinta-45 hover:text-tinta"
      >
        ← Volver a la campaña
      </Link>

      <div className="mt-5">
        <TiraCausa causa={c.causa} slug={slug} />
      </div>

      <h1 className="mt-6 text-[clamp(1.8rem,6vw,2.4rem)]">Elige tus números</h1>
      <p className="mt-3 leading-relaxed text-tinta-70">
        Cada número cuesta {money(c.precio)} y va directo a la causa de{" "}
        {c.organizador}.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border-2 border-tinta-15 bg-papel-alto" />
          Libre
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border-2 border-tara bg-tara-suave" />
          Separado
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border-2 border-chilca bg-chilca-suave" />
          Vendido
        </span>
        <button
          type="button"
          onClick={sorprendeme}
          className="ml-auto font-medium text-anil"
        >
          Sorpréndeme
        </button>
      </div>

      <div className="mt-5">
        <GrillaNumeros
          cantidad={c.cantidad}
          estadoDe={(n) => estadoNumero(c, n)}
          seleccionados={elegidos}
          onAlternar={alternar}
          maximo={MAXIMO}
        />
      </div>

      {elegidos.length >= MAXIMO && (
        <p className="mt-4 text-sm text-tinta-45">
          Puedes llevar hasta {MAXIMO} números por compra.
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-tinta-15 bg-papel/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-4">
          {/* El eco del comprador: qué logra con lo que acaba de elegir */}
          {elegidos.length > 0 ? (
            <p className="mb-3 text-sm">
              Con {elegidos.length} {elegidos.length === 1 ? "número" : "números"} aportas{" "}
              <span className="font-mono font-medium">{money(total)}</span> —{" "}
              <span className="text-chilca">{aporte}% de la meta</span>
              {faltaParaMeta > 0 && (
                <span className="text-tinta-45">
                  , y quedarían {moneyCorto(faltaParaMeta)} por juntar
                </span>
              )}
            </p>
          ) : (
            <p className="mb-3 text-sm text-tinta-45">
              Toca los números que quieras llevar.
            </p>
          )}

          <Button
            tamano="lg"
            className="w-full"
            disabled={elegidos.length === 0}
            onClick={() => setEtapa("datos")}
          >
            {elegidos.length === 0
              ? "Elige al menos un número"
              : `Continuar con ${elegidos.length}`}
          </Button>
        </div>
      </div>
    </main>
  );
}
