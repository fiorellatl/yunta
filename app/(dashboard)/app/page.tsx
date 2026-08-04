import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PortadaCampana } from "@/components/create/portada-campana";
import { BarraMeta } from "@/components/campaign/barra-meta";
import { misCampanas, ordenesPendientes } from "@/lib/data/campanas";
import { moneyCorto } from "@/lib/format";

export default async function MisCampanasPage() {
  const campanas = await misCampanas();
  const pendientes = await ordenesPendientes(campanas.map((c) => c.id));

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <span className="font-display text-2xl font-extrabold tracking-tight">Yunta</span>
        {campanas.length > 0 && (
          <ButtonLink href="/app/nueva" variante="secundario">
            Nueva campaña
          </ButtonLink>
        )}
      </header>

      {campanas.length === 0 ? (
        <div className="mt-16 text-center">
          <h1 className="text-3xl">¿Cuál es tu causa?</h1>
          <p className="mt-3 leading-relaxed text-tinta-70">
            Cuéntala en dos minutos y compártela hoy mismo. Nosotros armamos los
            números, el precio y la portada.
          </p>
          <ButtonLink href="/app/nueva" tamano="lg" className="mt-8 w-full">
            Empieza tu campaña
          </ButtonLink>
        </div>
      ) : (
        <>
          <h1 className="mt-8 text-3xl">Tus campañas</h1>

          <ul className="mt-6 space-y-5">
            {campanas.map((c) => {
              const precio = Number(c.price_per_number);
              const meta = c.goal_amount ? Number(c.goal_amount) : null;
              const porRevisar = pendientes[c.id] ?? 0;

              return (
                <li
                  key={c.id}
                  className="rounded-talon border border-tinta-15 bg-papel-alto p-4"
                >
                  <PortadaCampana causa={c.goal_title} meta={meta} foto={c.cover_url} />

                  <div className="mt-4">
                    <BarraMeta
                      recaudado={c.recaudado}
                      meta={meta}
                      maximo={precio * c.total_numbers}
                      vendidos={c.vendidos}
                      cantidad={c.total_numbers}
                    />
                  </div>

                  {/* Lo que el organizador necesita saber apenas abre la app */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    {porRevisar > 0 ? (
                      <span className="sello text-tara">
                        {porRevisar}{" "}
                        {porRevisar === 1 ? "pago por revisar" : "pagos por revisar"}
                      </span>
                    ) : (
                      <span className="text-sm text-tinta-45">
                        {c.status === "draft"
                          ? "Todavía sin publicar"
                          : "Nada pendiente por revisar"}
                      </span>
                    )}
                    <span className="shrink-0 font-mono text-sm text-tinta-45">
                      {c.reservados > 0 && `${c.reservados} separados · `}
                      {moneyCorto(precio)}
                    </span>
                  </div>

                  <Link
                    href={`/app/campanas/${c.id}`}
                    className="mt-4 block text-sm font-medium text-anil"
                  >
                    Administrar mi campaña →
                  </Link>
                </li>
              );
            })}
          </ul>

          <ButtonLink href="/app/nueva" variante="secundario" className="mt-8 w-full">
            Empezar otra campaña
          </ButtonLink>
        </>
      )}
    </main>
  );
}
