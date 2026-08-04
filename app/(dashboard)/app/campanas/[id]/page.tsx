import Link from "next/link";
import { notFound } from "next/navigation";
import { BarraMeta } from "@/components/campaign/barra-meta";
import { GrillaLectura } from "@/components/campaign/grilla-lectura";
import { BandejaOrdenes } from "@/components/admin/bandeja-ordenes";
import { DescargarAfiche } from "@/components/campaign/descargar-afiche";
import { PortadaCampana } from "@/components/create/portada-campana";
import { campanaDelOrganizador } from "@/lib/data/campanas";
import { diasHasta, fechaLarga, moneyCorto } from "@/lib/format";

export default async function PanelCampanaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const datos = await campanaDelOrganizador(id);

  if (!datos) notFound();

  const { campana, ordenes, numeros, vendidos, reservados, recaudado, apoyos } = datos;
  const precio = Number(campana.price_per_number);
  const meta = campana.goal_amount ? Number(campana.goal_amount) : null;
  const porRevisar = ordenes.filter((o) => o.status === "in_review");
  const fecha = campana.draw_date ? new Date(campana.draw_date) : null;
  const dias = campana.draw_date
    ? diasHasta(campana.draw_date.slice(0, 10))
    : null;

  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-6">
      <Link href="/app" className="text-sm font-medium text-tinta-45 hover:text-tinta">
        ← Mis campañas
      </Link>

      <div className="mt-5">
        <PortadaCampana
          causa={campana.goal_title}
          meta={meta}
          foto={campana.cover_url}
          paleta={campana.cover_palette}
        />
      </div>

      {/* Lo primero: cómo va */}
      <section className="mt-6 rounded-talon bg-tinta px-6 py-6 text-papel">
        <BarraMeta
          recaudado={recaudado}
          meta={meta}
          maximo={precio * campana.total_numbers}
          vendidos={vendidos}
          cantidad={campana.total_numbers}
          tono="oscuro"
        />
        <p className="mt-4 text-sm text-tinta-15">
          {apoyos === 0
            ? "Todavía nadie se ha sumado"
            : `${apoyos} ${apoyos === 1 ? "persona se sumó" : "personas se sumaron"}`}
          {dias !== null &&
            ` · ${dias === 0 ? "sorteas hoy" : dias === 1 ? "falta 1 día" : `faltan ${dias} días`}`}
        </p>
      </section>

      {/* Lo que necesita su atención, arriba de todo lo demás */}
      <section className="mt-9">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-2xl">
            {porRevisar.length > 0 ? "Pagos por revisar" : "Pagos"}
          </h2>
          {porRevisar.length > 0 && (
            <span className="sello text-tara">{porRevisar.length}</span>
          )}
        </div>

        {porRevisar.length > 0 && (
          <p className="mt-2 text-sm leading-relaxed text-tinta-70">
            Revisa que la plata te haya llegado al Yape y confirma. Al aprobar, los
            números quedan suyos.
          </p>
        )}

        <div className="mt-4">
          <BandejaOrdenes
            ordenes={porRevisar.length > 0 ? porRevisar : ordenes}
            campanaId={campana.id}
            digitos={String(campana.total_numbers).length}
          />
        </div>

        {porRevisar.length > 0 && ordenes.length > porRevisar.length && (
          <p className="mt-4 text-sm text-tinta-45">
            Y {ordenes.length - porRevisar.length} orden
            {ordenes.length - porRevisar.length === 1 ? "" : "es"} más ya resuelta
            {ordenes.length - porRevisar.length === 1 ? "" : "s"}.
          </p>
        )}
      </section>

      {/* El talonario completo */}
      <section className="mt-10">
        <h2 className="text-2xl">Tu talonario</h2>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border-2 border-chilca bg-chilca-suave" />
            {vendidos} vendidos
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border-2 border-tara bg-tara-suave" />
            {reservados} separados
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border-2 border-tinta-15 bg-papel-alto" />
            {campana.total_numbers - vendidos - reservados} libres
          </span>
        </div>

        <div className="mt-4">
          <GrillaLectura cantidad={campana.total_numbers} numeros={numeros} />
        </div>
      </section>

      {/* El afiche, siempre a mano para volver a compartir */}
      <section className="mt-10 rounded-talon border-2 border-tinta-15 bg-papel-alto p-5">
        <DescargarAfiche slug={campana.slug} causa={campana.goal_title} />
      </section>

      {/* El sorteo */}
      <section className="mt-10 rounded-talon border-2 border-tinta-15 bg-papel-alto p-5">
        <h2 className="text-xl">El sorteo</h2>
        {fecha && (
          <p className="mt-2 text-sm leading-relaxed text-tinta-70">
            Está programado para el {fechaLarga(fecha)}. Cuando llegue el día, Yunta
            elige al ganador y publica la prueba: tú solo avisas.
          </p>
        )}
        <p className="mt-4 text-sm text-tinta-45">
          Vendiendo todo juntas {moneyCorto(precio * campana.total_numbers)}.
        </p>
      </section>

      <Link
        href={`/r/${campana.slug}`}
        className="mt-8 block text-center text-sm font-medium text-anil"
      >
        Ver la página que ve la gente →
      </Link>
    </main>
  );
}
