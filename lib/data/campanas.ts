import { createClient } from "@/lib/supabase/server";
import type { Campaign, NumberStatus, Prize } from "@/types/database";

export type CampanaConDatos = Campaign & {
  prizes: Prize[];
  organizador: string;
  organizadorVerificado: boolean;
  vendidos: number[];
  reservados: number[];
  recaudado: number;
};

/**
 * Todo lo que necesita la página pública de una campaña, en una sola llamada.
 * Devuelve null si no existe o si todavía es borrador: las políticas RLS ya
 * filtran, esto solo evita renderizar media página vacía.
 */
export async function obtenerCampana(slug: string): Promise<CampanaConDatos | null> {
  const supabase = await createClient();

  const { data: campana } = await supabase
    .from("campaigns")
    .select("*, prizes(*), profiles!campaigns_owner_id_fkey(full_name, is_verified)")
    .eq("slug", slug)
    .maybeSingle();

  if (!campana) return null;

  const { data: numeros } = await supabase
    .from("campaign_numbers")
    .select("number, status")
    .eq("campaign_id", campana.id)
    .neq("status", "available");

  const porEstado = (estado: NumberStatus) =>
    (numeros ?? []).filter((n) => n.status === estado).map((n) => n.number);

  const vendidos = porEstado("sold");
  const perfil = (campana as unknown as {
    profiles: { full_name: string | null; is_verified: boolean } | null;
  }).profiles;

  return {
    ...(campana as unknown as Campaign),
    prizes: [...((campana as unknown as { prizes: Prize[] }).prizes ?? [])].sort(
      (a, b) => a.position - b.position,
    ),
    organizador: perfil?.full_name ?? "El organizador",
    organizadorVerificado: perfil?.is_verified ?? false,
    vendidos,
    reservados: porEstado("reserved"),
    recaudado: vendidos.length * Number(campana.price_per_number),
  };
}

/** Las campañas del organizador que tiene la sesión abierta. */
export async function misCampanas() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("campaigns")
    .select("*, prizes(id)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (!data?.length) return [];

  // Un solo viaje para los números de todas las campañas.
  const { data: numeros } = await supabase
    .from("campaign_numbers")
    .select("campaign_id, status")
    .in("campaign_id", data.map((c) => c.id))
    .neq("status", "available");

  return data.map((c) => {
    const propios = (numeros ?? []).filter((n) => n.campaign_id === c.id);
    const vendidos = propios.filter((n) => n.status === "sold").length;
    return {
      ...(c as unknown as Campaign),
      vendidos,
      reservados: propios.filter((n) => n.status === "reserved").length,
      recaudado: vendidos * Number(c.price_per_number),
    };
  });
}

/** Órdenes esperando revisión, para el aviso del panel. */
export async function ordenesPendientes(campaignIds: string[]) {
  if (!campaignIds.length) return {} as Record<string, number>;

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("campaign_id")
    .in("campaign_id", campaignIds)
    .eq("status", "in_review");

  return (data ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.campaign_id] = (acc[o.campaign_id] ?? 0) + 1;
    return acc;
  }, {});
}
