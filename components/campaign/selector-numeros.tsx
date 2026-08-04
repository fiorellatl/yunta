"use client";

import { useState } from "react";
import Link from "next/link";
import { GrillaNumeros } from "@/components/campaign/grilla-numeros";
import { TiraCausa } from "@/components/campaign/tira-causa";
import { NumberStub, type EstadoNumero } from "@/components/raffle/number-stub";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatearTelefono, money, moneyCorto, telefonoValido } from "@/lib/format";

export type CampanaParaComprar = {
  slug: string;
  causa: string;
  organizador: string;
  precio: number;
  cantidad: number;
  maxPorCompra: number;
  meta: number | null;
  maximo: number;
  recaudado: number;
  vendidos: number[];
  reservados: number[];
};

export function SelectorNumeros({ c }: { c: CampanaParaComprar }) {
  const [etapa, setEtapa] = useState<"elegir" | "datos" | "listo">("elegir");
  const [elegidos, setElegidos] = useState<number[]>([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const total = elegidos.length * c.precio;
  const referencia = c.meta ?? c.maximo;
  const aporte = total > 0 ? Math.max(1, Math.round((total / referencia) * 100)) : 0;
  const faltaParaMeta = Math.max(0, referencia - c.recaudado - total);
  const ordenados = [...elegidos].sort((a, b) => a - b);
  const digitos = String(c.cantidad).length;

  function estadoDe(n: number): EstadoNumero {
    if (c.vendidos.includes(n)) return "vendido";
    if (c.reservados.includes(n)) return "reservado";
    return "disponible";
  }

  function alternar(n: number) {
    setElegidos((e) => (e.includes(n) ? e.filter((x) => x !== n) : [...e, n]));
  }

  function sorprendeme() {
    const libres = Array.from({ length: c.cantidad }, (_, i) => i + 1).filter(
      (n) => estadoDe(n) === "disponible" && !elegidos.includes(n),
    );
    if (libres.length) {
      setElegidos((e) => [...e, libres[Math.floor(Math.random() * libres.length)]]);
    }
  }

  // Última etapa: la reserva todavía no está conectada, y decirlo es mejor
  // que simular un apartado que no existe.
  if (etapa === "listo") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
        <span className="sello self-start text-tara">Casi</span>
        <h1 className="mt-5 text-[clamp(1.9rem,6.5vw,2.5rem)]">
          Estos serían tus números.
        </h1>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {ordenados.map((n) => (
            <span key={n} className="animate-talon w-12">
              <NumberStub numero={n} seleccionado digitos={digitos} />
            </span>
          ))}
        </div>

        <p className="mt-6 leading-relaxed text-tinta-70">
          Todavía estamos terminando los pagos dentro de Yunta, así que por ahora no
          podemos guardártelos. Escríbele a {c.organizador} para coordinar, o vuelve
          en unos días.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button variante="secundario" tamano="lg" onClick={() => setEtapa("elegir")}>
            Elegir otros números
          </Button>
          <Link
            href={`/r/${c.slug}`}
            className="text-center text-sm font-medium text-tinta-45 hover:text-tinta"
          >
            Volver a la campaña
          </Link>
        </div>
      </main>
    );
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
            if (listo) setEtapa("listo");
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
              className="mt-2 cifra"
            />
          </label>

          <div className="mt-7 rounded-talon bg-anil-suave px-5 py-4">
            <p className="text-sm text-tinta-70">Tus números</p>
            <p className="mt-1 cifra text-lg">{ordenados.join(" · ")}</p>
            <p className="mt-2 cifra text-3xl">{money(total)}</p>
          </div>

          <div className="mt-auto pt-8">
            <Button type="submit" tamano="lg" className="w-full" disabled={!listo}>
              Sepárame estos números
            </Button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-36 pt-6">
      <Link
        href={`/r/${c.slug}`}
        className="text-sm font-medium text-tinta-45 hover:text-tinta"
      >
        ← Volver a la campaña
      </Link>

      <div className="mt-5">
        <TiraCausa causa={c.causa} slug={c.slug} />
      </div>

      <h1 className="mt-6 text-[clamp(1.8rem,6vw,2.4rem)]">Elige tus números</h1>
      <p className="mt-3 leading-relaxed text-tinta-70">
        Cada número cuesta {money(c.precio)} y va directo a la causa de {c.organizador}.
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
          className="ml-auto rounded-talon-sm border-2 border-anil px-3 py-1.5 text-sm font-semibold text-anil transition-colors hover:bg-anil-suave"
        >
          Que la suerte elija
        </button>
      </div>

      <div className="mt-5">
        <GrillaNumeros
          cantidad={c.cantidad}
          estadoDe={estadoDe}
          seleccionados={elegidos}
          onAlternar={alternar}
          maximo={c.maxPorCompra}
        />
      </div>

      {elegidos.length >= c.maxPorCompra && (
        <p className="mt-4 text-sm text-tinta-45">
          Puedes llevar hasta {c.maxPorCompra} números por compra.
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-tinta-15 bg-papel/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-4">
          {elegidos.length > 0 ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <span className="shrink-0 text-[0.7rem] font-bold uppercase tracking-wider text-tinta-45">
                  Tuyos
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ordenados.map((n) => (
                    <span key={n} className="animate-talon w-10">
                      <NumberStub numero={n} seleccionado digitos={digitos} />
                    </span>
                  ))}
                </div>
              </div>

              <p className="mb-3 text-sm">
                Aportas <span className="cifra">{money(total)}</span> —{" "}
                <span className="text-chilca">{aporte}% de la meta</span>
                {faltaParaMeta > 0 && (
                  <span className="text-tinta-45">
                    , faltarían {moneyCorto(faltaParaMeta)}
                  </span>
                )}
              </p>
            </>
          ) : (
            <p className="mb-3 text-sm text-tinta-45">
              Toca el número que quieras. Si te da igual, deja que la suerte elija.
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
