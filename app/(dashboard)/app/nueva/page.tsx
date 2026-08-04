"use client";

import { useEffect, useRef, useState } from "react";
import { PasoPregunta } from "@/components/create/paso-pregunta";
import { Chips } from "@/components/create/chips";
import { Input, InputCifra } from "@/components/ui/input";
import { PortadaCampana } from "@/components/create/portada-campana";
import { PremiosEditor } from "@/components/create/premios-editor";
import { CampanaIniciada } from "@/components/create/campana-iniciada";
import { publicarCampana } from "@/lib/actions/campaigns";
import {
  BORRADOR_VACIO,
  PASOS,
  comboSugerido,
  contraMeta,
  ordinal,
  pasoCompleto,
  premiosValidos,
  proponerCombos,
  recaudacionMaxima,
  type BorradorCampana,
} from "@/lib/domain/campana";
import {
  diasHasta,
  fechaInput,
  fechaLarga,
  formatearTelefono,
  money,
  moneyCorto,
  sumarDias,
} from "@/lib/format";

const CAUSAS = [
  "Un viaje de promoción",
  "Un tratamiento médico",
  "Mi equipo o banda",
  "Un emprendimiento",
  "Un albergue de animales",
];
const METAS = [1000, 2000, 5000, 10000] as const;
const PLAZOS = [7, 14, 30] as const;
const TOTAL = PASOS.length;

export default function NuevaCampanaPage() {
  const [paso, setPaso] = useState(0);
  const [b, setB] = useState<BorradorCampana>(BORRADOR_VACIO);
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicada, setPublicada] = useState<string | null>(null);
  const primerCampo = useRef<HTMLInputElement>(null);

  const actual = PASOS[paso];
  const puede = pasoCompleto(actual, b);
  const total = recaudacionMaxima(b);
  const balance = contraMeta(b);
  const premios = premiosValidos(b.premios);

  const set = (parche: Partial<BorradorCampana>) => setB((v) => ({ ...v, ...parche }));
  const atras = () => setPaso((p) => Math.max(p - 1, 0));

  function avanzar() {
    // Al pasar del arranque económico, Yunta ya deja propuesto el combo.
    if (PASOS[paso] === "meta" && !b.precio && !b.cantidad) {
      const combo = comboSugerido({ ...b });
      set({ precio: combo.precio, cantidad: combo.cantidad });
    }
    setPaso((p) => Math.min(p + 1, TOTAL - 1));
  }

  useEffect(() => {
    primerCampo.current?.focus();
  }, [paso]);

  async function publicar() {
    if (!b.precio || !b.cantidad) return;
    setPublicando(true);
    setError(null);

    const resultado = await publicarCampana({
      causa: b.causa.trim(),
      meta: b.meta,
      precio: b.precio,
      cantidad: b.cantidad,
      premios: premios.map((p, i) => ({ nombre: p.nombre.trim(), posicion: i + 1 })),
      fechaSorteo: b.fechaSorteo,
      yape: b.yape,
      titular: b.titular.trim(),
    });

    setPublicando(false);
    if (resultado.ok) setPublicada(resultado.slug);
    else setError(resultado.mensaje);
  }

  if (publicada) {
    return (
      <CampanaIniciada
        slug={publicada}
        causa={b.causa.trim()}
        meta={b.meta}
        precio={b.precio ?? 0}
        cantidad={b.cantidad ?? 0}
        premios={premios.length}
        fechaSorteo={b.fechaSorteo}
        portadaFoto={b.portadaFoto}
      />
    );
  }

  const marco = {
    indice: paso,
    total: TOTAL,
    puedeAvanzar: puede,
    onAvanzar: avanzar,
    onAtras: paso > 0 ? atras : undefined,
  };

  // 1 · La causa. La primera pregunta es por qué, no por qué cosa.
  if (actual === "causa") {
    return (
      <PasoPregunta
        {...marco}
        pregunta="¿Para qué estás juntando?"
        ayuda="Dilo como se lo contarías a alguien. Esto es lo que va a mover a la gente."
        eco={
          b.causa.trim().length >= 4 && (
            <p className="font-display text-xl leading-tight">
              Estamos juntando para{" "}
              <span className="text-anil">{b.causa.trim()}</span>
            </p>
          )
        }
      >
        <Input
          ref={primerCampo}
          value={b.causa}
          onChange={(e) => set({ causa: e.target.value })}
          placeholder="El viaje de promoción de la 5.° B"
          maxLength={90}
          autoComplete="off"
          aria-label="Para qué estás juntando"
        />
        <div className="mt-4">
          <Chips
            opciones={CAUSAS}
            valor={CAUSAS.includes(b.causa) ? b.causa : null}
            onElegir={(v) => set({ causa: v })}
            etiqueta="Causas frecuentes"
          />
        </div>
      </PasoPregunta>
    );
  }

  // 2 · La meta. Nunca bloquea: se puede seguir sin saberla.
  if (actual === "meta") {
    const sugerido = b.meta ? proponerCombos(b.meta)[0] : null;
    return (
      <PasoPregunta
        {...marco}
        pregunta="¿Cuánto necesitas juntar?"
        ayuda="Si todavía no lo sabes, no importa. Lo puedes definir después."
        eco={
          sugerido && (
            <p>
              Con esa meta te alcanza con{" "}
              <span className="font-mono font-medium">
                {sugerido.cantidad} números a {moneyCorto(sugerido.precio)}
              </span>
              . Lo armamos en el siguiente paso.
            </p>
          )
        }
      >
        <Chips
          opciones={METAS}
          valor={METAS.includes(b.meta as never) ? (b.meta as (typeof METAS)[number]) : null}
          onElegir={(v) => set({ meta: v, metaOmitida: false })}
          formato={(v) => moneyCorto(v)}
          etiqueta="Metas frecuentes"
        />
        <div className="mt-4">
          <InputCifra
            ref={primerCampo}
            prefijo="S/"
            value={b.meta ?? ""}
            onChange={(e) =>
              set({ meta: Number(e.target.value.replace(/\D/g, "")) || null, metaOmitida: false })
            }
            placeholder="0"
            aria-label="Meta de recaudación"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            set({ meta: null, metaOmitida: true });
            avanzar();
          }}
          className="mt-4 text-sm font-medium text-tinta-45 hover:text-tinta"
        >
          Todavía no lo sé
        </button>
      </PasoPregunta>
    );
  }

  // 3 · La cara de la campaña.
  if (actual === "portada") {
    return (
      <PasoPregunta
        {...marco}
        pregunta="Ponle cara a tu campaña"
        ayuda="Una foto de las personas, del equipo, del lugar. Si no tienes una, ya te armamos esta portada."
        textoAvanzar={b.portadaFoto ? "Siguiente" : "Usar esta portada"}
      >
        <PortadaCampana causa={b.causa} meta={b.meta} foto={b.portadaFoto} />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="cursor-pointer text-sm font-medium text-anil">
            {b.portadaFoto ? "Cambiar la foto" : "Subir una foto"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) set({ portadaFoto: URL.createObjectURL(archivo) });
              }}
            />
          </label>
          {b.portadaFoto && (
            <button
              type="button"
              onClick={() => set({ portadaFoto: null })}
              className="text-sm font-medium text-tinta-45 hover:text-tinta"
            >
              Usar la portada de Yunta
            </button>
          )}
        </div>
      </PasoPregunta>
    );
  }

  // 4 · El mecanismo, ya resuelto por Yunta.
  if (actual === "armado") {
    const combos = b.meta ? proponerCombos(b.meta) : [];
    return (
      <PasoPregunta
        {...marco}
        pregunta={b.meta ? "Así se arma tu rifa" : "Empecemos con esto"}
        ayuda={
          b.meta
            ? "Hicimos la cuenta por ti. Puedes cambiarla cuando quieras."
            : "Una configuración para arrancar. La ajustas cuando tengas clara tu meta."
        }
        eco={
          total && (
            <p>
              Si vendes todo juntas{" "}
              <span className="font-mono text-xl font-medium">{moneyCorto(total)}</span>
              {balance && balance.diferencia >= 0 && (
                <span className="mt-1 block text-sm text-tinta-70">
                  {balance.diferencia === 0
                    ? "Justo tu meta."
                    : `Te pasas de tu meta por ${moneyCorto(balance.diferencia)}.`}
                </span>
              )}
              {balance && balance.diferencia < 0 && (
                <span className="mt-1 block text-sm text-tinta-70">
                  Te faltarían {moneyCorto(-balance.diferencia)} para tu meta.
                </span>
              )}
            </p>
          )
        }
      >
        {combos.length > 1 && (
          <div className="mb-4">
            <Chips
              opciones={combos.map((c) => `${c.cantidad}×${c.precio}`)}
              valor={b.cantidad && b.precio ? `${b.cantidad}×${b.precio}` : null}
              onElegir={(v) => {
                const [cantidad, precio] = v.split("×").map(Number);
                set({ cantidad, precio });
              }}
              formato={(v) => {
                const [cantidad, precio] = v.split("×").map(Number);
                return `${cantidad} a ${moneyCorto(precio)}`;
              }}
              etiqueta="Combinaciones sugeridas"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="text-sm font-medium">Números</span>
            <InputCifra
              ref={primerCampo}
              value={b.cantidad ?? ""}
              onChange={(e) => set({ cantidad: Number(e.target.value.replace(/\D/g, "")) || null })}
              placeholder="100"
              className="mt-2"
              aria-label="Cantidad de números"
            />
          </label>
          <label>
            <span className="text-sm font-medium">Cada uno</span>
            <InputCifra
              prefijo="S/"
              value={b.precio ?? ""}
              onChange={(e) => set({ precio: Number(e.target.value.replace(/\D/g, "")) || null })}
              placeholder="10"
              className="mt-2"
              aria-label="Precio por número"
            />
          </label>
        </div>

        {b.cantidad && b.cantidad > 2000 && (
          <p className="mt-3 text-sm text-cochinilla">Por ahora el máximo es 2000 números.</p>
        )}
      </PasoPregunta>
    );
  }

  // 5 · Los premios: el incentivo para apoyar la causa.
  if (actual === "premios") {
    return (
      <PasoPregunta
        {...marco}
        pregunta="¿Qué se van a ganar?"
        ayuda="El premio es lo que empuja a comprar. Puedes poner uno o varios."
        eco={
          premios.length > 0 && (
            <div>
              <p className="text-sm text-tinta-70">Así se va a ver el podio</p>
              <ol className="mt-2 space-y-1">
                {premios.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="w-10 shrink-0 font-mono text-anil">
                      {ordinal(i + 1)}
                    </span>
                    <span className="min-w-0 truncate">{p.nombre}</span>
                  </li>
                ))}
              </ol>
              {premios.length === 1 && (
                <p className="mt-3 text-sm text-tinta-70">
                  Un segundo premio le da a la gente otra razón para comprar más de un número.
                </p>
              )}
            </div>
          )
        }
      >
        <PremiosEditor premios={b.premios} onCambiar={(p) => set({ premios: p })} />
      </PasoPregunta>
    );
  }

  // 6 · La fecha, convertida en un plan diario.
  if (actual === "fecha") {
    const dias = b.fechaSorteo ? Math.max(1, diasHasta(b.fechaSorteo)) : null;
    const porDia = dias && b.cantidad ? Math.ceil(b.cantidad / dias) : null;

    return (
      <PasoPregunta
        {...marco}
        pregunta="¿Cuándo es el sorteo?"
        ayuda="Una fecha cercana apura las ventas."
        eco={
          dias &&
          porDia && (
            <p>
              Tienes <span className="font-medium">{dias} días</span> para vender{" "}
              {b.cantidad} números.
              <span className="mt-1 block font-mono text-xl font-medium">
                {porDia} por día
              </span>
            </p>
          )
        }
      >
        <Chips
          opciones={PLAZOS}
          valor={PLAZOS.find((d) => fechaInput(sumarDias(d)) === b.fechaSorteo) ?? null}
          onElegir={(d) => set({ fechaSorteo: fechaInput(sumarDias(d)) })}
          formato={(d) => (d === 7 ? "En 1 semana" : d === 14 ? "En 2 semanas" : "En 1 mes")}
          etiqueta="Plazos sugeridos"
        />
        <div className="mt-4">
          <Input
            ref={primerCampo}
            type="date"
            value={b.fechaSorteo}
            min={fechaInput(sumarDias(1))}
            onChange={(e) => set({ fechaSorteo: e.target.value })}
            aria-label="Fecha del sorteo"
          />
        </div>
      </PasoPregunta>
    );
  }

  // 7 · El cobro.
  if (actual === "cobro") {
    return (
      <PasoPregunta
        {...marco}
        pregunta="¿A qué número te yapean?"
        ayuda="Es el número que van a ver tus compradores para pagarte."
        eco={
          b.yape.length === 9 && (
            <p>
              Cada pago te llega directo a tu Yape.
              <span className="mt-1 block text-sm text-tinta-70">
                Yunta no recibe ni retiene tu dinero en ningún momento.
              </span>
            </p>
          )
        }
      >
        <Input
          ref={primerCampo}
          type="tel"
          inputMode="numeric"
          value={formatearTelefono(b.yape)}
          onChange={(e) => set({ yape: e.target.value.replace(/\D/g, "").slice(0, 9) })}
          placeholder="987 654 321"
          className="font-mono tabular-nums"
          aria-label="Número de Yape o Plin"
        />
        <label className="mt-4 block">
          <span className="text-sm font-medium">¿A nombre de quién?</span>
          <Input
            value={b.titular}
            onChange={(e) => set({ titular: e.target.value })}
            placeholder="María Quispe"
            autoComplete="name"
            className="mt-2"
          />
        </label>
      </PasoPregunta>
    );
  }

  // 8 · La vista previa de lo que verá la gente.
  return (
    <PasoPregunta
      {...marco}
      pregunta="Así lo van a ver"
      textoAvanzar={publicando ? "Publicando…" : "Publicar mi campaña"}
      puedeAvanzar={puede && !publicando}
      onAvanzar={publicar}
    >
      <div className="troquel border border-tinta-15 p-5">
        <PortadaCampana causa={b.causa} meta={b.meta} foto={b.portadaFoto} />

        <div className="mt-5 flex items-center justify-between rounded-talon-sm bg-anil-suave px-4 py-3">
          <span className="text-sm text-tinta-70">Cada número</span>
          <span className="font-mono text-xl font-medium">{money(b.precio ?? 0)}</span>
        </div>

        <div className="linea-corte my-5" />

        <h3 className="text-sm font-medium">
          {premios.length === 1 ? "El premio" : "Los premios"}
        </h3>
        <ol className="mt-2 space-y-1">
          {premios.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="w-10 shrink-0 font-mono text-anil">{ordinal(i + 1)}</span>
              <span className="min-w-0 truncate">{p.nombre}</span>
            </li>
          ))}
        </ol>

        <dl className="mt-5 space-y-1 border-t border-tinta-15 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-tinta-70">Números</dt>
            <dd className="font-mono">{b.cantidad}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-tinta-70">Sorteo</dt>
            <dd className="font-mono">
              {b.fechaSorteo && fechaLarga(new Date(`${b.fechaSorteo}T12:00:00`))}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-tinta-70">Te pagan al</dt>
            <dd className="font-mono">{formatearTelefono(b.yape)}</dd>
          </div>
          <div className="flex justify-between pt-1">
            <dt className="font-medium">Si vendes todo</dt>
            <dd className="font-mono font-medium text-chilca">{moneyCorto(total ?? 0)}</dd>
          </div>
        </dl>
      </div>

      <label className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          checked={b.terminos}
          onChange={(e) => set({ terminos: e.target.checked })}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--anil)]"
        />
        <span className="text-sm leading-relaxed text-tinta-70">
          Esta campaña es mía. Yo entrego los premios y respondo por ella ante quienes
          me apoyen. Acepto los términos y condiciones de Yunta.
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-talon-sm bg-cochinilla-suave px-4 py-3 text-sm text-tinta">
          {error}
        </p>
      )}
    </PasoPregunta>
  );
}
