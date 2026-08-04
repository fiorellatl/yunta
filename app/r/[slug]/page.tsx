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

      <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-anil">
        Campaña de {c.organizador}
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

      {/* 5 · Confianza */}
      <section className="mt-10 rounded-talon bg-tinta px-6 py-7 text-papel">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-tara">
          Sorteo verificable
        </p>
        <h2 className="mt-3 text-xl text-papel">
          El resultado no depende de la palabra de nadie.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-tinta-15">
          Cuando esta campaña se publicó, Yunta selló un código y lo dejó a la vista.
          El día del sorteo se revela y con él se calcula el número ganador.
          Cualquiera puede rehacer la cuenta.
        </p>
        {c.seed_hash && (
          <p className="mt-4 break-all font-mono text-xs text-tara">{c.seed_hash}</p>
        )}
      </section>

      <section className="mt-8 rounded-talon border border-tinta-15 bg-papel-alto p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-anil-suave font-display text-lg font-bold text-anil">
            {c.organizador.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="font-medium">{c.organizador}</p>
            <p className="text-sm text-tinta-45">
              {c.organizadorVerificado ? "Identidad verificada" : "Sin verificar"}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-tinta-70">
          Esta campaña la organiza y responde {c.organizador}. Tu pago va directo a su
          Yape: Yunta no recibe ni retiene el dinero.{" "}
          <Link href="/legal/terminos" className="text-anil underline underline-offset-4">
            Cómo funciona
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
