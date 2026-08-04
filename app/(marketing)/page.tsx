import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PortadaCampana } from "@/components/create/portada-campana";
import { BarraMeta } from "@/components/campaign/barra-meta";

const PASOS = [
  {
    titulo: "Cuenta tu causa",
    texto:
      "Para qué estás juntando y cuánto necesitas. Yunta arma el resto: los números, el precio y la portada.",
  },
  {
    titulo: "Compártela por WhatsApp",
    texto:
      "Un link que se abre en el celular de cualquiera. Quien quiere apoyar elige su número y paga por Yape.",
  },
  {
    titulo: "Recibe y confirma",
    texto:
      "El dinero llega directo a tu cuenta. Tú apruebas cada pago y todos ven cómo avanza la meta.",
  },
];

const EJEMPLOS = [
  { causa: "El viaje de promoción de la 5.° B", meta: 2000 },
  { causa: "La operación de mi mamá", meta: 8000 },
  { causa: "Instrumentos para la banda del colegio", meta: 3500 },
  { causa: "Comida para el albergue de Villa El Salvador", meta: 1500 },
];

export default function Home() {
  return (
    <main>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <span className="font-display text-2xl font-extrabold tracking-tight">Yunta</span>
        <ButtonLink href="/login" variante="secundario">
          Entrar
        </ButtonLink>
      </header>

      {/* Portada */}
      <section className="mx-auto grid max-w-5xl gap-14 px-5 pb-20 pt-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-16">
        <div>
          <h1 className="text-[clamp(2.6rem,7.5vw,4.5rem)]">
            Toda causa merece una oportunidad.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-tinta-70">
            Yunta te ayuda a reunir a las personas que la van a hacer posible. Creas tu
            campaña, la compartes por WhatsApp y recaudas con total transparencia.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/app/nueva" tamano="lg">
              Empieza tu campaña
            </ButtonLink>
            <ButtonLink
              href="/r/viaje-de-promocion-5b-x7k2"
              variante="secundario"
              tamano="lg"
            >
              Ver una campaña
            </ButtonLink>
          </div>
          <p className="mt-5 font-mono text-xs text-tinta-45">
            Gratis mientras estamos en piloto · El dinero llega directo a tu Yape
          </p>
        </div>

        {/* Una campaña en marcha, no una ilustración de producto */}
        <div className="mx-auto w-full max-w-sm">
          <div className="troquel border border-tinta-15 p-5 shadow-[0_18px_40px_-24px_rgba(19,26,51,0.4)]">
            <PortadaCampana causa="El viaje de promoción de la 5.° B" meta={2000} />
            <div className="mt-5">
              <BarraMeta
                recaudado={340}
                meta={2000}
                maximo={2000}
                vendidos={34}
                cantidad={200}
              />
            </div>
            <div className="linea-corte my-5" />
            <p className="text-sm text-tinta-70">
              <span className="font-medium">34 personas</span> ya se sumaron
            </p>
          </div>
        </div>
      </section>

      {/* La tesis del producto */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-[clamp(1.9rem,4vw,2.75rem)]">
          Las mejores campañas empiezan con una buena historia.
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-tinta-70">
          Nadie apoya una rifa. La gente apoya a alguien. Por eso en Yunta lo primero
          que se ve es para qué estás juntando, y recién después cómo puede ayudar.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {EJEMPLOS.map((e) => (
            <li key={e.causa}>
              <PortadaCampana causa={e.causa} meta={e.meta} />
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-xs text-tinta-45">
          Ejemplos de portada. Cada campaña genera la suya al instante.
        </p>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-[clamp(1.9rem,4vw,2.75rem)]">Cómo funciona</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo}>
              <span className="font-mono text-sm text-anil">0{i + 1}</span>
              <div className="linea-corte my-3" />
              <h3 className="text-xl">{paso.titulo}</h3>
              <p className="mt-2 leading-relaxed text-tinta-70">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Confianza */}
      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="rounded-talon bg-tinta px-7 py-12 text-papel md:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-tara">
            Transparencia
          </p>
          <h2 className="mt-4 max-w-xl text-[clamp(1.8rem,4vw,2.6rem)] text-papel">
            Quien te apoya puede comprobar todo.
          </h2>

          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              [
                "El dinero no pasa por nosotros",
                "Cada pago va directo a tu Yape. Yunta no recibe, no retiene y no cobra comisión.",
              ],
              [
                "El avance está a la vista",
                "Cuánto llevas, cuánta gente se sumó y cuánto falta. Lo mismo para todos.",
              ],
              [
                "El sorteo se puede verificar",
                "Sellamos un código al publicar y lo revelamos al sortear. Cualquiera rehace la cuenta.",
              ],
            ].map(([titulo, texto]) => (
              <div key={titulo}>
                <h3 className="text-lg text-papel">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tinta-15">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* La rifa es un mecanismo, no el producto */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-2xl">Hoy con rifas. Pronto, como tú quieras juntar.</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-tinta-70">
          Empezamos por las rifas porque es como junta plata la mayoría de la gente en
          el Perú. Vienen las polladas, los bingos, las preventas y las donaciones
          directas. La campaña es la misma; cambia la forma de aportar.
        </p>
      </section>

      {/* Responsabilidad, de frente */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <span className="sello self-start text-cochinilla">Ojo</span>
          <div>
            <h2 className="text-2xl">Cada campaña es de quien la organiza</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-tinta-70">
              Yunta es la herramienta con la que armas y administras tu campaña. No
              recibimos ni guardamos el dinero, y la entrega de los premios corre por
              cuenta del organizador. Al publicar una campaña aceptas los{" "}
              <Link
                href="/legal/terminos"
                className="font-medium text-anil underline underline-offset-4"
              >
                términos y condiciones
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="rounded-talon border border-tinta-15 bg-papel-alto px-7 py-12 text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)]">¿Cuál es tu causa?</h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-tinta-70">
            Cuéntala en dos minutos y compártela hoy mismo.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/app/nueva" tamano="lg">
              Empieza tu campaña
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-5 pb-12 pt-6">
        <div className="linea-corte mb-6" />
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-tinta-45">
          <span className="font-display font-extrabold text-tinta">Yunta</span>
          <div className="flex gap-6">
            <Link href="/design" className="hover:text-tinta">
              Sistema visual
            </Link>
            <Link href="/legal/terminos" className="hover:text-tinta">
              Términos
            </Link>
            <Link href="/legal/privacidad" className="hover:text-tinta">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
