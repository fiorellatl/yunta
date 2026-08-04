import { notFound } from "next/navigation";
import { SelectorNumeros } from "@/components/campaign/selector-numeros";
import { obtenerCampana } from "@/lib/data/campanas";

export default async function ComprarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await obtenerCampana(slug);

  if (!c) notFound();

  const precio = Number(c.price_per_number);

  return (
    <SelectorNumeros
      c={{
        slug: c.slug,
        causa: c.goal_title,
        organizador: c.organizador.trim().split(" ")[0] || "el organizador",
        precio,
        cantidad: c.total_numbers,
        maxPorCompra: c.max_per_order,
        meta: c.goal_amount ? Number(c.goal_amount) : null,
        maximo: precio * c.total_numbers,
        recaudado: c.recaudado,
        vendidos: c.vendidos,
        reservados: c.reservados,
      }}
    />
  );
}
