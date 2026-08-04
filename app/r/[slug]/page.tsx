import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarraMeta } from "@/components/campaign/barra-meta";
import { ButtonLink } from "@/components/ui/button";
import { Podio } from "@/components/campaign/podio";
import { Franja } from "@/components/campaign/franja";
import { SelloVerificable } from "@/components/campaign/sello-verificable";
import { obtenerCampana } from "@/lib/data/campanas";
import { enFrase } from "@/lib/domain/texto";
import { fechaLarga, money, moneyCorto } from "@/lib/format";

/** Lo que se lee bajo la imagen cuando alguien pega el enlace en un chat. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await obtenerCampana(slug);

  if (!c) return { title: "Campaña no encontrada · Yunta" };

  const precio = money(Number(c.price_per_number));
  const nombre = c.organizador.trim().split(" ")[0];

  return {
    title: `${c.goal_title} · Yunta`,
    description: `${nombre} está juntando para ${enFrase(c.goal_title)}. Cada número cuesta ${precio} y entra al sorteo. Elige el tuyo.`,
    openGraph: {
      title: c.goal_title,
      description: `Cada número cuesta ${precio}. Súmate a la causa de ${nombre}.`,
      type: "website",
    },
  };
}

export default async function CampanaPublicaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await obtenerCampana(slug);

  if (!c) notFound();

  const precio = Number(c.price_per_number);
  const meta = c.goal_amount ? Number(c.goal_amount) : null;
  const maximo = precio * c.total_numbers;
  const fecha = c.draw_date ? new Date(c.draw_date) : null;
  const dias = fecha
    ? Math.max(0, Math.ceil((fecha.getTime() - Date.now()) / 86400000))
    : null;
  const primerNombre = c.organizador.trim().split(" ")[0] || "el organizador";

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
          Yunta
        </Link>
        {dias !== null && (
          <span className="cifra text-xs text-tinta-45">
            {dias === 0 ? "sortea hoy" : dias === 1 ? "falta 1 día" : `faltan ${dias} días`}
          </span>
        )}
      </header>

      {/* La foto solo si es una foto de verdad. La portada tipográfica
          existe para la imagen que se comparte, no para repetir el título. */}
      {c.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.cover_url}
          alt={c.goal_title}
          className="mt-6 aspect-[16/10] w-full rounded-talon object-cover"
        />
      )}

      {/* 1 · La causa domina. Es el H1 y nada compite con él. */}
      <h1 className="mt-8 text-[clamp(2.4rem,10vw,3.6rem)] uppercase leading-[0.98]">
        {c.goal_title}
      </h1>

      <p className="mt-6 text-2xl leading-snug">
        Estamos juntando{" "}
        <span className="cifra whitespace-nowrap">{moneyCorto(meta ?? maximo)}</span>
      </p>
      <p className="mt-1 text-lg text-tinta-70">por {primerNombre}</p>

      <ButtonLink href={`/r/${c.slug}/comprar`} tamano="lg" className="mt-7 w-full">
        Quiero apoyar
      </ButtonLink>

      {/* 2 · Cómo va. La meta ya se dijo arriba: acá solo el avance. */}
      <div className="mt-8 rounded-talon border border-tinta-15 bg-papel-alto p-5">
        <BarraMeta
          recaudado={c.recaudado}
          meta={meta}
          maximo={maximo}
          vendidos={c.vendidos.length}
          cantidad={c.total_numbers}
          mostrarMeta={false}
        />

        {c.apoyos > 0 && (
          <p className="mt-4 border-t border-tinta-15 pt-4 text-sm">
            <span className="cifra text-lg">{c.apoyos}</span>{" "}
            {c.apoyos === 1 ? "persona ya se sumó" : "personas ya se sumaron"}
          </p>
        )}
      </div>

      {/* 3 · La historia */}
      {c.story && (
        <section className="mt-8">
          <p className="whitespace-pre-line leading-relaxed text-tinta-70">{c.story}</p>
        </section>
      )}

      {/* 4 · Los premios apoyan la decisión, no compiten con la causa */}
      {c.prizes.length > 0 && (
        <section className="mt-12">
          <Franja alto={6} className="rounded-full" />
          <h2 className="mt-5 text-[clamp(1.7rem,5.5vw,2.2rem)]">
            {c.prizes.length === 1 ? "Y esto te puedes ganar" : "Y esto se sortea"}
          </h2>
          {fecha && (
            <p className="mt-2 text-sm text-tinta-70">
              Cada número entra al sorteo del {fechaLarga(fecha)}.
            </p>
          )}

          <div className="mt-5">
            <Podio premios={c.prizes} />
          </div>
        </section>
      )}

      {/* 5 · Quién está detrás */}
      <section className="mt-12 overflow-hidden rounded-talon border-2 border-tinta-15 bg-papel-alto">
        <Franja alto={7} />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cochinilla-suave font-display text-2xl font-extrabold text-cochinilla">
              {primerNombre.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-[0.7rem] font-bold uppercase tracking-wider text-tinta-45">
                Detrás de esta campaña
              </p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight">
                {primerNombre}
              </p>
            </div>
          </div>

          <p className="mt-5 leading-relaxed text-tinta-70">
            {primerNombre} puso la cara por esta causa: organiza la rifa, entrega los
            premios y responde por ella. Tu plata le llega directo a su Yape —
            Yunta no la toca ni se queda con nada.
          </p>
        </div>
      </section>

      {/* La letra no tan chica */}
      <section className="mt-10 border-t border-tinta-15 pt-6">
        <h2 className="text-base font-semibold">Y el sorteo no lo decide nadie</h2>
        <p className="mt-2 text-sm leading-relaxed text-tinta-45">
          Al publicar esta campaña se guardó un código sellado que ya no se puede
          cambiar. El día del sorteo se destapa, y de ese código sale el número
          ganador. Si quieres, después puedes rehacer la cuenta tú mismo y comprobar
          que salió así.
        </p>
        {c.seed_hash && <SelloVerificable hash={c.seed_hash} />}
        <p className="mt-4 text-sm text-tinta-45">
          <Link
            href="/legal/terminos"
            className="underline underline-offset-4 hover:text-tinta"
          >
            Cómo funciona Yunta
          </Link>
        </p>
      </section>

      {/* Barra fija: el paso siguiente siempre a la mano */}
      <div className="fixed inset-x-0 bottom-0 border-t border-tinta-15 bg-papel/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="cifra text-xl">{money(precio)}</p>
            <p className="text-xs text-tinta-45">por número</p>
          </div>
          <ButtonLink href={`/r/${c.slug}/comprar`} tamano="lg" className="flex-1">
            Quiero apoyar
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
