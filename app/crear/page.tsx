"use client";

import { useEffect, useRef, useState } from "react";
import { PasoPregunta } from "@/components/create/paso-pregunta";
import { Chips } from "@/components/create/chips";
import { Input, InputCifra } from "@/components/ui/input";
import { PortadaCampana } from "@/components/create/portada-campana";
import { PremiosEditor } from "@/components/create/premios-editor";
import { CampanaIniciada } from "@/components/create/campana-iniciada";
import { Continuidad } from "@/components/create/continuidad";
import { AvisoBorrador } from "@/components/create/aviso-borrador";
import { Franja } from "@/components/campaign/franja";
import { publicarCampana } from "@/lib/actions/campaigns";
import { subirImagen } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/client";
import {
  borrarBorrador,
  guardarBorrador,
  leerBorrador,
  limpiarMarcaPublicar,
  marcarPendientePublicar,
} from "@/lib/draft/borrador";
import {
  BORRADOR_VACIO,
  PASOS,
  PALETAS,
  comboSugerido,
  contraMeta,
  ordinal,
  paletaDe,
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

// Semillas para empezar a escribir, no respuestas cerradas: al tocarlas
// rellenan el campo y dejan el cursor listo para que el organizador
// termine la frase con lo suyo.
const CAUSAS = [
  "El viaje de promoción de ",
  "El tratamiento de ",
  "Los uniformes de ",
  "Mi emprendimiento de ",
  "El albergue de ",
];
const METAS = [1000, 2000, 5000, 10000] as const;
const PLAZOS = [7, 14, 30] as const;
const TOTAL = PASOS.length;

export default function CrearCampanaPage() {
  const [paso, setPaso] = useState(0);
  const [b, setB] = useState<BorradorCampana>(BORRADOR_VACIO);
  const [fase, setFase] = useState<"armando" | "continuidad">("armando");
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicada, setPublicada] = useState<string | null>(null);
  const [correoSesion, setCorreoSesion] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [retomando, setRetomando] = useState(false);
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

  // Al abrir: recupera el borrador y, si volvemos de autenticarnos con la
  // publicación pendiente, la termina sola. El usuario no vuelve a decidir.
  useEffect(() => {
    let vivo = true;

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const guardado = await leerBorrador();
      if (!vivo) return;

      if (user?.email) setCorreoSesion(user.email);

      if (guardado) {
        setB(guardado.borrador);
        setPaso(guardado.paso);

        // El aviso solo si volvió en otra sesión del navegador: recargar
        // en medio del flujo no debería interrumpir a nadie.
        const MISMA_SESION = "yunta.sesion";
        const tieneAlgoQueRetomar = guardado.borrador.causa.trim().length > 0;
        if (
          tieneAlgoQueRetomar &&
          !sessionStorage.getItem(MISMA_SESION) &&
          !guardado.pendientePublicar
        ) {
          setRetomando(true);
        }
        sessionStorage.setItem(MISMA_SESION, "1");

        if (guardado.pendientePublicar && user) {
          // Se limpia la marca antes de publicar: si recarga a mitad,
          // no queremos crear la campaña dos veces.
          await limpiarMarcaPublicar();
          setFase("continuidad");
          publicar(guardado.borrador);
        } else if (guardado.pendientePublicar) {
          setFase("continuidad");
        }
      }

      setListo(true);
    })();

    return () => {
      vivo = false;
    };
    // Solo al montar: es la recuperación inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Espejo en disco de todo lo que va escribiendo.
  useEffect(() => {
    if (!listo || publicada) return;
    guardarBorrador(b, paso);
  }, [b, paso, listo, publicada]);

  async function publicar(borrador: BorradorCampana = b) {
    if (!borrador.precio || !borrador.cantidad) return;
    setPublicando(true);
    setError(null);

    // Las fotos viven como URLs locales hasta acá; se suben recién ahora,
    // cuando ya sabemos que la campaña se va a publicar de verdad.
    const portadaUrl = borrador.portadaArchivo
      ? await subirImagen(borrador.portadaArchivo, "campaign-covers")
      : null;

    const premiosConFoto = await Promise.all(
      premiosValidos(borrador.premios).map(async (p, i) => ({
        nombre: p.nombre.trim(),
        posicion: i + 1,
        fotoUrl: p.fotoArchivo ? await subirImagen(p.fotoArchivo, "prize-images") : null,
      })),
    );

    const resultado = await publicarCampana({
      causa: borrador.causa.trim(),
      historia: borrador.historia,
      meta: borrador.meta,
      precio: borrador.precio,
      cantidad: borrador.cantidad,
      premios: premiosConFoto,
      portadaUrl,
      fechaSorteo: borrador.fechaSorteo,
      yape: borrador.yape,
      titular: borrador.titular.trim(),
      portadaPaleta: borrador.portadaPaleta,
    });

    setPublicando(false);

    if (resultado.ok) {
      setPublicada(resultado.slug);
      await borrarBorrador();
    } else {
      setError(resultado.mensaje);
    }
  }

  if (fase === "continuidad" && !publicada) {
    return (
      <Continuidad
        causa={b.causa.trim()}
        meta={b.meta ?? total ?? 0}
        correoSesion={correoSesion}
        terminos={b.terminos}
        onTerminos={(v) => set({ terminos: v })}
        onPublicar={() => publicar()}
        onAtras={() => setFase("armando")}
        onAntesDeSalir={() => marcarPendientePublicar(b, paso)}
        error={error}
        publicando={publicando}
      />
    );
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
        portadaPaleta={b.portadaPaleta}
      />
    );
  }

  async function empezarDeNuevo() {
    await borrarBorrador();
    setB(BORRADOR_VACIO);
    setPaso(0);
    setRetomando(false);
  }

  const marco = {
    indice: paso,
    total: TOTAL,
    puedeAvanzar: puede,
    onAvanzar: avanzar,
    onAtras: paso > 0 ? atras : undefined,
    aviso: retomando ? (
      <AvisoBorrador
        causa={b.causa.trim()}
        onContinuar={() => setRetomando(false)}
        onEmpezarDeNuevo={empezarDeNuevo}
      />
    ) : undefined,
  };

  // 1 · La causa. La primera pregunta es por qué, no por qué cosa.
  if (actual === "causa") {
    return (
      <PasoPregunta
        {...marco}
        pregunta="¿Para qué estás juntando?"
        ayuda="Dilo como se lo contarías a alguien. Empieza con una de abajo y termínala con lo tuyo."
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
        {/* La historia es lo que hace que alguien comparta. Va acá y no en
            un paso propio: sumar pantallas encarece los dos minutos. */}
        {b.causa.trim().length >= 4 && (
          <label className="mt-5 block">
            <span className="text-sm font-medium">
              ¿Quieres contar un poco más?{" "}
              <span className="font-normal text-tinta-45">Opcional</span>
            </span>
            <textarea
              rows={4}
              value={b.historia}
              onChange={(e) => set({ historia: e.target.value })}
              maxLength={600}
              placeholder="Quiénes son, qué está pasando y para qué es la plata. Dos o tres líneas bastan."
              className="mt-2 w-full rounded-talon-sm border-2 border-tinta-15 bg-papel-alto p-4 leading-relaxed outline-none placeholder:text-tinta-45 focus:border-anil"
            />
            <span className="mt-1 block text-xs text-tinta-45">
              Es lo que la gente lee antes de decidir si apoya.
            </span>
          </label>
        )}

        <div className="mt-4">
          <Chips
            opciones={CAUSAS}
            valor={null}
            onElegir={(v) => {
              set({ causa: v });
              // El cursor queda al final para seguir escribiendo de una.
              requestAnimationFrame(() => {
                const campo = primerCampo.current;
                if (!campo) return;
                campo.focus();
                campo.setSelectionRange(v.length, v.length);
              });
            }}
            formato={(v) => v.trim() + "…"}
            etiqueta="Para empezar"
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
              <span className="cifra">
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
        <PortadaCampana
          causa={b.causa}
          meta={b.meta}
          foto={b.portadaFoto}
          paleta={b.portadaPaleta ?? undefined}
        />

        {!b.portadaFoto && (
          <div className="mt-4">
            <p className="text-sm font-medium">O elige otro color</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PALETAS.map((p, i) => {
                const activa = (b.portadaPaleta ?? paletaDe(b.causa || "Tu campaña")) === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => set({ portadaPaleta: i })}
                    aria-label={`Portada ${i + 1}`}
                    aria-pressed={activa}
                    className={[
                      "h-10 w-10 rounded-md border-2 transition-transform",
                      activa ? "border-tinta scale-110" : "border-tinta-15",
                    ].join(" ")}
                    style={{ background: p.fondo }}
                  />
                );
              })}
            </div>
          </div>
        )}

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
                if (archivo)
                  set({
                    portadaFoto: URL.createObjectURL(archivo),
                    portadaArchivo: archivo,
                  });
              }}
            />
          </label>
          {b.portadaFoto && (
            <button
              type="button"
              onClick={() => set({ portadaFoto: null, portadaArchivo: null })}
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
              <span className="cifra text-2xl">{moneyCorto(total)}</span>
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
                    <span className="cifra w-10 shrink-0 text-anil">
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
              <span className="mt-1 block cifra text-2xl">
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
        ayuda="No va en tu página: solo lo ve quien ya eligió sus números y está por pagarte."
        eco={
          b.yape.length === 9 && (
            <p>
              Cada pago te llega directo a tu Yape.
              <span className="mt-1 block text-sm text-tinta-70">
                Yunta no recibe ni retiene tu dinero, y tu número no queda publicado
                en la página de la campaña.
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
          className="cifra"
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
      textoAvanzar="Publicar mi campaña"
      puedeAvanzar
      onAvanzar={() => setFase("continuidad")}
    >
      {/* Ticket de rifa: portada arriba, premios al centro, talón abajo */}
      <div className="overflow-hidden rounded-talon border-2 border-tinta bg-papel-alto">
        <Franja alto={9} />

        <div className="p-4">
          <PortadaCampana
            causa={b.causa}
            meta={b.meta}
            foto={b.portadaFoto}
            paleta={b.portadaPaleta ?? undefined}
          />

          {/* Collage de premios */}
          <p className="mt-5 text-[0.7rem] font-bold uppercase tracking-wider text-tinta-45">
            {premios.length === 1 ? "El premio" : `${premios.length} premios`}
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {premios.map((p, i) => (
              <li
                key={i}
                className={[
                  "overflow-hidden rounded-talon-sm border-2",
                  i === 0 ? "col-span-2 border-tara" : "border-tinta-15",
                ].join(" ")}
              >
                <div
                  className={[
                    "relative w-full bg-tara-suave",
                    i === 0 ? "aspect-[16/7]" : "aspect-[4/3]",
                  ].join(" ")}
                >
                  {p.fotoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.fotoPreview}
                      alt={p.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center px-3 text-center">
                      <span className="cifra text-sm uppercase leading-tight">
                        {p.nombre}
                      </span>
                    </span>
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded bg-tinta px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-papel">
                    {ordinal(i + 1)}
                  </span>
                </div>
                {p.fotoPreview && (
                  <p className="truncate px-2 py-1.5 text-xs font-medium">{p.nombre}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* El talón: perforación y datos duros, como el pie de un boleto */}
        <div className="linea-corte" />
        <div className="bg-papel p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-wider text-tinta-45">
                Cada número
              </p>
              <p className="cifra text-3xl">{money(b.precio ?? 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-[0.7rem] font-bold uppercase tracking-wider text-tinta-45">
                Sorteo
              </p>
              <p className="cifra text-sm">
                {b.fechaSorteo && fechaLarga(new Date(`${b.fechaSorteo}T12:00:00`))}
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-1 border-t border-tinta-15 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-tinta-70">Números</dt>
              <dd className="cifra">{b.cantidad}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-tinta-70">Te pagan al</dt>
              <dd className="cifra">{formatearTelefono(b.yape)}</dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="font-medium">Si vendes todo</dt>
              <dd className="cifra text-chilca">{moneyCorto(total ?? 0)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Publicar no se puede deshacer: callarlo es lo que traba el último clic. */}
      <div className="mt-6 rounded-talon border-2 border-tara bg-tara-suave p-5">
        <p className="font-medium">Revisa antes de publicar</p>
        <p className="mt-2 text-sm leading-relaxed text-tinta-70">
          Todavía no se puede editar una campaña publicada, así que sale a la calle
          tal como la ves acá arriba. Mira sobre todo el precio, la cantidad de
          números y la fecha.
        </p>
      </div>

      {/* Lo que deja de ser su problema apenas publique */}
      <div className="mt-4 rounded-talon bg-anil-suave p-5">
        <p className="font-medium">Desde que publiques, Yunta lleva la cuenta</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-tinta-70">
          <li>· Bloquea cada número apenas alguien lo elige</li>
          <li>· Te ordena los comprobantes para que apruebes con un toque</li>
          <li>· Lleva el avance al día, sin cuaderno ni Excel</li>
          <li>· Hace el sorteo y publica la prueba</li>
        </ul>
      </div>

    </PasoPregunta>
  );
}
