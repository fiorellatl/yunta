import type { Metadata } from "next";
import { PortadaCampana } from "@/components/create/portada-campana";
import { NumberStub } from "@/components/raffle/number-stub";
import { Button } from "@/components/ui/button";
import { PALETAS } from "@/lib/domain/campana";

export const metadata: Metadata = {
  title: "Sistema visual · Yunta",
  description:
    "Los principios, el razonamiento y las piezas del sistema de diseño de Yunta.",
};

const EJEMPLOS_PORTADA = [
  { causa: "El viaje de promoción de la 5.° B", meta: 2000 },
  { causa: "La operación de mi mamá", meta: 8000 },
  { causa: "El albergue de Villa El Salvador", meta: 1500 },
  { causa: "Instrumentos para la banda", meta: 3500 },
  { causa: "La inicial de nuestra casa", meta: null as number | null },
];

const TINTES = [
  ["anil", "#2A3FA6", "Añil", "Acción y confianza. El primario."],
  ["cochinilla", "#C4183C", "Cochinilla", "Alerta y énfasis. Nunca decorativo."],
  ["chilca", "#0F8F70", "Chilca", "Vendido, pagado, logrado."],
  ["tara", "#E0A01A", "Tara", "Reservado, pendiente, atención."],
  ["tinta", "#131A33", "Tinta", "Texto y superficies oscuras."],
  ["papel", "#F6F4EF", "Papel", "El fondo de todo."],
];

function Bloque({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-tinta-15 py-14">
      <span className="font-mono text-sm text-anil">{numero}</span>
      <h2 className="mt-3 text-[clamp(1.7rem,4vw,2.4rem)]">{titulo}</h2>
      <div className="mt-7 max-w-2xl">{children}</div>
    </section>
  );
}

function Regla({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed text-tinta-70">
      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-anil" />
      <span>{children}</span>
    </li>
  );
}

export default function SistemaVisualPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-10">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-anil">
        Sistema visual
      </p>
      <h1 className="mt-4 text-[clamp(2.4rem,7vw,3.6rem)]">
        Cómo se ve y cómo habla Yunta.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-tinta-70">
        Yunta ayuda a personas comunes a juntar dinero para algo que les importa. El
        sistema entero está al servicio de dos cosas: que se entienda rápido y que dé
        confianza. Cada decisión de acá abajo se puede explicar con una de esas dos.
      </p>

      <Bloque numero="01" titulo="Principios visuales">
        <ul className="space-y-4">
          <Regla>
            <strong className="font-medium text-tinta">
              Las referencias son materiales, no folclóricas.
            </strong>{" "}
            Papel, tinta plana, sellos, perforaciones, numeración, señalética de
            mercado, tipografía de imprenta. Nada de textiles de fondo, llamas ni
            montañas. Debe sentirse peruano, no disfrazado de peruano.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">
              Lo andino entra por la estructura.
            </strong>{" "}
            Proporción, repetición y ritmo antes que ornamento. Si una cita cultural no
            sostiene una función, no entra.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">
              Un solo gesto fuerte por pantalla.
            </strong>{" "}
            La perforación aparece una vez, no en cada tarjeta. Lo demás se calla para
            que ese gesto se note.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">Honestidad de material.</strong>{" "}
            Sin sombras que finjan profundidad ni degradados que finjan luz. Superficies
            planas, bordes claros, una sombra de 2px bajo los botones porque el papel
            impreso también la tiene.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">Optimismo, no lujo.</strong>{" "}
            Los colores son saturados y directos, como un cartel de barrio bien hecho.
            Nada de dorados, serifas de revista ni estética de producto caro.
          </Regla>
        </ul>
      </Bloque>

      <Bloque numero="02" titulo="Principios de UX">
        <ul className="space-y-4">
          <Regla>
            <strong className="font-medium text-tinta">
              Una pregunta por pantalla.
            </strong>{" "}
            Nada de formularios largos. La creación de una campaña es una conversación
            de ocho preguntas, cada una con su propia pantalla.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">
              Cada pantalla devuelve algo.
            </strong>{" "}
            La regla del <em>eco</em>: si una pantalla pide un dato, tiene que entregar
            algo a cambio — una cuenta hecha, una vista previa, un plan. Si no se te
            ocurre qué devolver, la pantalla probablemente sobra.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">
              Ningún dato bloquea el avance.
            </strong>{" "}
            Si el organizador no sabe su meta, Yunta propone una configuración y sigue.
            El producto se adapta a la persona, no al revés.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">
              Primero el pulgar, después el mouse.
            </strong>{" "}
            Todo se diseña a 375px. Botones de 44px o más, atajos en chips para no
            teclear, autofoco en cada pregunta para que el teclado ya esté abierto.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">
              Las cifras que importan van en grande.
            </strong>{" "}
            Cuánto puede juntar, cuánto lleva, cuánto falta. Son la razón por la que
            alguien está acá.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">
              Los estados vacíos invitan.
            </strong>{" "}
            Una campaña en cero no dice &ldquo;sin datos&rdquo;: dice a quién mandarle el
            link primero.
          </Regla>
        </ul>
      </Bloque>

      <Bloque numero="03" titulo="Tono">
        <p className="leading-relaxed text-tinta-70">
          Yunta habla como un amigo que sabe del tema y no te hace sentir tonto. Cercano
          sin ser confianzudo, claro sin ser seco. Usa el vocabulario de la calle
          peruana cuando es el término real —yapear, separar, juntar— y evita el de
          producto —onboarding, dashboard, wallet.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-talon border-2 border-chilca bg-chilca-suave p-5">
            <p className="sello inline-block text-chilca text-[0.6rem]">Así sí</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>&ldquo;¿Para qué estás juntando?&rdquo;</li>
              <li>&ldquo;Te separamos estos números&rdquo;</li>
              <li>&ldquo;Tienes 14 días para vender 200 números. Son 15 por día.&rdquo;</li>
              <li>&ldquo;Yunta no recibe ni retiene tu dinero.&rdquo;</li>
            </ul>
          </div>
          <div className="rounded-talon border-2 border-cochinilla bg-cochinilla-suave p-5">
            <p className="sello inline-block text-cochinilla text-[0.6rem]">Así no</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>&ldquo;Configura tu campaña&rdquo;</li>
              <li>&ldquo;Reserva procesada exitosamente&rdquo;</li>
              <li>&ldquo;Optimiza tu tasa de conversión&rdquo;</li>
              <li>&ldquo;¡Ups! Algo salió mal 😅&rdquo;</li>
            </ul>
          </div>
        </div>

        <ul className="mt-7 space-y-4">
          <Regla>
            Voz activa y el mismo verbo de punta a punta: si el botón dice{" "}
            <em>Publicar</em>, el mensaje siguiente dice <em>Publicada</em>.
          </Regla>
          <Regla>
            Los errores explican qué pasó y qué hacer. No se disculpan ni hacen chistes.
          </Regla>
          <Regla>
            Nunca prometemos resultados: &ldquo;un segundo premio da más razones para
            comprar&rdquo;, no &ldquo;vende 40% más&rdquo;. No inventamos cifras.
          </Regla>
        </ul>
      </Bloque>

      <Bloque numero="04" titulo="Tipografía">
        <div className="space-y-6">
          <div className="rounded-talon border border-tinta-15 bg-papel-alto p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-tinta-45">
              Display · Bricolage Grotesque
            </p>
            <p className="mt-3 font-display text-4xl font-bold tracking-tight">
              Toda causa merece una oportunidad.
            </p>
            <p className="mt-3 text-sm text-tinta-70">
              Titulares. Tiene carácter sin ser rara, y aguanta bien los tamaños
              grandes que necesita una cifra o una frase corta. Siempre con{" "}
              <code className="font-mono">tracking-tight</code> y{" "}
              <code className="font-mono">text-wrap: balance</code>.
            </p>
          </div>

          <div className="rounded-talon border border-tinta-15 bg-papel-alto p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-tinta-45">
              Texto · Instrument Sans
            </p>
            <p className="mt-3 text-lg leading-relaxed">
              Somos 32 chicos de la promoción y queremos cerrar el colegio con un viaje.
              Con cada número nos ayudas a llegar.
            </p>
            <p className="mt-3 text-sm text-tinta-70">
              Interfaz y párrafos. Neutra, muy legible en pantallas baratas, con
              interlineado holgado para textos largos.
            </p>
          </div>

          <div className="rounded-talon border border-tinta-15 bg-papel-alto p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-tinta-45">
              Datos · Geist Mono
            </p>
            <p className="mt-3 cifra text-4xl">S/ 2,000 · 087 · YT-4KQ2</p>
            <p className="mt-3 text-sm text-tinta-70">
              Todo lo que es cifra: montos, números de rifa, códigos, fechas cortas,
              cuentas regresivas. Siempre <code className="font-mono">tabular-nums</code>{" "}
              para que no bailen al actualizarse. Es también el guiño de imprenta del
              sistema.
            </p>
          </div>
        </div>

        <p className="mt-7 leading-relaxed text-tinta-70">
          <strong className="font-medium text-tinta">La regla que las separa:</strong> si
          es un número que el usuario va a comparar, verificar o dictar, va en mono. Si
          es una idea, va en sans. Nunca se mezclan en la misma línea salvo que la cifra
          sea el sujeto de la frase.
        </p>
      </Bloque>

      <Bloque numero="05" titulo="Color">
        <p className="leading-relaxed text-tinta-70">
          La paleta viene de tintes naturales peruanos, reinterpretados en digital. No es
          un dato decorativo: da una gama que ningún producto de software usa por defecto,
          y que se puede explicar en una frase.
        </p>

        <ul className="mt-7 space-y-3">
          {TINTES.map(([token, hex, nombre, uso]) => (
            <li
              key={token}
              className="flex items-center gap-4 rounded-talon-sm border border-tinta-15 bg-papel-alto p-3"
            >
              <span
                className="h-12 w-12 shrink-0 rounded-md border border-tinta-15"
                style={{ background: hex }}
              />
              <div className="min-w-0">
                <p className="font-medium">
                  {nombre}{" "}
                  <span className="font-mono text-sm font-normal text-tinta-45">
                    {hex}
                  </span>
                </p>
                <p className="text-sm text-tinta-70">{uso}</p>
              </div>
            </li>
          ))}
        </ul>

        <ul className="mt-7 space-y-4">
          <Regla>
            <strong className="font-medium text-tinta">Un color, un significado.</strong>{" "}
            Chilca es siempre &ldquo;logrado&rdquo;, tara siempre &ldquo;en
            espera&rdquo;, cochinilla siempre &ldquo;atención&rdquo;. Jamás se usan por
            gusto estético.
          </Regla>
          <Regla>
            El primario es añil justamente para que cochinilla quede libre como alerta.
            Un producto con marca roja no puede señalar errores en rojo.
          </Regla>
          <Regla>
            Sin degradados. Tinta plana, como la impresión de un cartel a dos tintas.
          </Regla>
          <Regla>
            Fondo oscuro (<code className="font-mono">tinta</code>) solo para los bloques
            donde la cifra manda: el marcador de la campaña y el panel de transparencia.
          </Regla>
        </ul>

        <p className="mt-7 text-sm font-medium">Portadas generadas</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {PALETAS.map((_, i) => (
            <PortadaCampana
              key={i}
              paleta={i}
              causa={EJEMPLOS_PORTADA[i % EJEMPLOS_PORTADA.length].causa}
              meta={EJEMPLOS_PORTADA[i % EJEMPLOS_PORTADA.length].meta}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-tinta-70">
          La paleta se elige a partir del texto de la causa, así que una campaña siempre
          se ve igual. Sin esperas y sin servicios externos: ninguna campaña queda sin
          cara.
        </p>
      </Bloque>

      <Bloque numero="06" titulo="Espaciado y ritmo">
        <ul className="space-y-4">
          <Regla>
            Escala de 4px. En la práctica se usan pocos valores:{" "}
            <code className="font-mono">8 · 12 · 16 · 20 · 28 · 36 · 48 · 72</code>.
            Menos opciones, más consistencia.
          </Regla>
          <Regla>
            El aire separa ideas, no elementos. Entre un título y su párrafo van 12px;
            entre dos secciones distintas, 56px o más. Si dos cosas están cerca es porque
            significan lo mismo.
          </Regla>
          <Regla>
            Ancho de lectura máximo de 65 caracteres. En móvil el contenido va a 420px y
            el margen lateral siempre es de 20px.
          </Regla>
          <Regla>
            Radios: 14px para superficies (tarjetas, portadas), 8px para controles
            (botones, campos, talones). Nada completamente redondo salvo las barras de
            progreso.
          </Regla>
        </ul>

        <div className="mt-7">
          <p className="text-sm font-medium">Ritmo</p>
          <div className="mt-3 rounded-talon bg-tinta p-6">
            <span className="ritmo text-tara" aria-hidden="true">
              {Array.from({ length: 20 }, (_, i) => (
                <i key={i} />
              ))}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-tinta-70">
            Módulos de altura alta-baja-media-baja, en secuencia fija. Es la única cita
            textil del sistema y solo aparece donde tiene tamaño suficiente para leerse
            como estructura. Se probó como línea de corte de 1px y ahí se leía como
            defecto de render, no como intención: por eso la perforación volvió a ser
            pareja.
          </p>
        </div>
      </Bloque>

      <Bloque numero="07" titulo="Iconografía">
        <ul className="space-y-4">
          <Regla>
            <strong className="font-medium text-tinta">
              Preferimos palabras y números.
            </strong>{" "}
            Un ícono es una abstracción más que el usuario tiene que descifrar. Si cabe
            la palabra, va la palabra.
          </Regla>
          <Regla>
            Cuando hace falta: trazo de 2px, esquinas y uniones redondeadas, sin relleno,
            tamaño 18 o 20px. El mismo peso que la tipografía que lo acompaña.
          </Regla>
          <Regla>
            Nunca un botón solo con ícono, salvo &ldquo;volver&rdquo; y
            &ldquo;cerrar&rdquo;, que siempre llevan{" "}
            <code className="font-mono">aria-label</code>.
          </Regla>
          <Regla>
            Cero emojis en la interfaz. Sí en los mensajes de WhatsApp que redacta el
            usuario, porque ahí sí es cómo habla la gente.
          </Regla>
          <Regla>
            El estado no se comunica con íconos sino con <em>sellos</em>: etiquetas en
            mono con borde, heredadas del sello de goma del organizador.
          </Regla>
        </ul>
      </Bloque>

      <Bloque numero="08" titulo="Reglas de composición">
        <ul className="space-y-4">
          <Regla>
            <strong className="font-medium text-tinta">La causa manda.</strong> En
            cualquier pantalla pública, el orden es: para qué se junta → cómo va → la
            historia → el premio. Nunca al revés.
          </Regla>
          <Regla>
            <strong className="font-medium text-tinta">
              La acción siguiente siempre a la mano.
            </strong>{" "}
            Barra fija abajo con el precio a la izquierda y el botón a la derecha. En el
            pulgar, no al final del scroll.
          </Regla>
          <Regla>
            Una sola jerarquía por pantalla: un titular, un dato grande, un botón
            primario. Si hay dos botones primarios, uno está de más.
          </Regla>
          <Regla>
            Las cifras se alinean a la derecha y en tabular; el texto a la izquierda.
            Nunca centrado, salvo el cierre de una pantalla de celebración.
          </Regla>
          <Regla>
            El troquel marca la pieza principal de la pantalla y solo esa. Es el
            equivalente a subrayar: si subrayas todo, no subrayaste nada.
          </Regla>
        </ul>

        <div className="mt-8 rounded-talon border border-tinta-15 bg-papel-alto p-5">
          <p className="text-sm font-medium">Piezas base</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button>Botón primario</Button>
            <Button variante="secundario">Secundario</Button>
            <Button variante="fantasma">Fantasma</Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="sello text-chilca">Pagado</span>
            <span className="sello text-tara">Separado</span>
            <span className="sello text-cochinilla">Rechazado</span>
          </div>
          <div className="mt-5 grid w-full max-w-xs grid-cols-6 gap-1.5">
            {[
              "vendido",
              "vendido",
              "disponible",
              "reservado",
              "disponible",
              "vendido",
            ].map((estado, i) => (
              <NumberStub
                key={i}
                numero={i + 1}
                estado={estado as "vendido" | "disponible" | "reservado"}
              />
            ))}
          </div>
          <div className="linea-corte my-5" />
          <p className="text-sm text-tinta-70">
            Línea de corte, talones y sellos: el vocabulario completo cabe en una
            tarjeta.
          </p>
        </div>
      </Bloque>
    </main>
  );
}
