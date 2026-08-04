import Link from "next/link";
import { notFound } from "next/navigation";
import { PortadaCampana } from "@/components/create/portada-campana";
import { BarraMeta } from "@/components/campaign/barra-meta";
import { ButtonLink } from "@/components/ui/button";
import { Podio } from "@/components/campaign/podio";
import { Franja } from "@/components/campaign/franja";
import { obtenerCampana } from "@/lib/data/campanas";
import { fechaLarga, money } from "@/lib/format";

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
  const fecha = c.draw_date ? new Date(c.draw_date) : null;
  const dias = fecha
    ? Math.max(0, Math.ceil((fecha.getTime() - Date.now()) / 86400000))
    : null;
  // Solo el primer nombre: "María" es una persona, "María Quispe Huamán" es un registro.
  const primerNombre = c.organizador.trim().split(" ")[0] || "El organizador";

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
          Yunta
        </Link>
        {dias !== null && (
          <span className="font-mono text-xs text-tinta-45">
            {dias === 0 ? "sortea hoy" : dias === 1 ? "falta 1 día" : `faltan ${dias} días`}
          </span>
        )}
      </header>

      {/* 1 · La causa, antes que nada */}
      <div className="mt-6">
        <PortadaCampana
          causa={c.goal_title}
          meta={meta}
          foto={c.cover_url}
          paleta={c.cover_palette}
        />
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-cochinilla">
        {primerNombre} está juntando para
      </p>
      <h1 className="mt-2 text-[clamp(1.9rem,6.5vw,2.6rem)]">{c.goal_title}</h1>

      {/* 2 · Cómo va. Una causa a medio camino convence más que una vacía. */}
      <div className="mt-7 rounded-talon border border-tinta-15 bg-papel-alto p-5">
        <BarraMeta
          recaudado={c.recaudado}
          meta={meta}
          maximo={precio * c.total_numbers}
          vendidos={c.vendidos.length}
          cantidad={c.total_numbers}
        />

        {c.apoyos > 0 && (
          <p className="mt-4 border-t border-tinta-15 pt-4 text-sm">
            <span className="cifra text-lg">{c.apoyos}</span>{" "}
            {c.apoyos === 1 ? "persona ya se sumó" : "personas ya se sumaron"}
            {c.apoyos >= 3 && <span className="text-tinta-45"> · súmate tú</span>}
          </p>
        )}
      </div>

      {/* 3 · La historia */}
      {c.story && (
        <section className="mt-8">
          <p className="whitespace-pre-line leading-relaxed text-tinta-70">{c.story}</p>
        </section>
      )}

      {/* 4 · Recién ahora, el incentivo — pero con todo su peso visual */}
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

      {/* 5 · Quién está detrás. Una cara, no una etiqueta. */}
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

      {/* La letra no tan chica: al final, para quien quiera saber cómo */}
      <section className="mt-10 border-t border-tinta-15 pt-6">
        <h2 className="text-base font-semibold">Y el sorteo no lo decide nadie</h2>
        <p className="mt-2 text-sm leading-relaxed text-tinta-45">
          Al publicar esta campaña se guardó un código sellado que ya no se puede
          cambiar. El día del sorteo se destapa, y de ese código sale el número
          ganador. Si quieres, después puedes rehacer la cuenta tú mismo y comprobar
          que salió así.
        </p>
        {c.seed_hash && (
          <p className="mt-3 break-all font-mono text-[0.65rem] text-tinta-15">
            {c.seed_hash}
          </p>
        )}
        <p className="mt-4 text-sm text-tinta-45">
          <Link href="/legal/terminos" className="underline underline-offset-4 hover:text-tinta">
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
