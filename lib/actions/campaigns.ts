"use server";

import { createClient } from "@/lib/supabase/server";
import { generarSlug, paletaDe } from "@/lib/domain/campana";

export type ResultadoPublicar =
  | { ok: true; slug: string }
  | { ok: false; mensaje: string };

type DatosCampana = {
  causa: string;
  meta: number | null;
  precio: number;
  cantidad: number;
  premios: { nombre: string; posicion: number }[];
  fechaSorteo: string;
  yape: string;
  titular: string;
  portadaUrl?: string | null;
  portadaPaleta?: number | null;
};

/**
 * Crea la campaña, sus premios y la publica en una sola pasada: el organizador
 * respondió ocho preguntas, no debería tener que "guardar" y luego "publicar".
 */
export async function publicarCampana(datos: DatosCampana): Promise<ResultadoPublicar> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { ok: false, mensaje: "Falta conectar la base de datos." };
  }
  if (datos.premios.length === 0) {
    return { ok: false, mensaje: "Agrega al menos un premio." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, mensaje: "Tu sesión venció. Entra otra vez." };

  const sufijo = Math.random().toString(36).slice(2, 6);
  const slug = generarSlug(datos.causa, sufijo);

  const { data: campana, error } = await supabase
    .from("campaigns")
    .insert({
      owner_id: user.id,
      slug,
      goal_title: datos.causa,
      goal_amount: datos.meta,
      cover_source: datos.portadaUrl ? "photo" : "typographic",
      cover_url: datos.portadaUrl ?? null,
      cover_palette: datos.portadaPaleta ?? paletaDe(datos.causa),
      price_per_number: datos.precio,
      total_numbers: datos.cantidad,
      draw_date: `${datos.fechaSorteo}T20:00:00-05:00`,
      yape_phone: datos.yape,
      plin_phone: datos.yape,
      account_holder_name: datos.titular,
      terms_accepted_at: new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (error || !campana) {
    return { ok: false, mensaje: "No pudimos crear tu campaña. Inténtalo otra vez." };
  }

  const { error: errorPremios } = await supabase.from("prizes").insert(
    datos.premios.map((p) => ({
      campaign_id: campana.id,
      position: p.posicion,
      name: p.nombre,
    })),
  );

  if (errorPremios) {
    return { ok: false, mensaje: "No pudimos guardar los premios. Inténtalo otra vez." };
  }

  const { error: errorPublicar } = await supabase.rpc("publish_campaign", {
    p_campaign_id: campana.id,
  });

  if (errorPublicar) {
    return { ok: false, mensaje: "Tu campaña se guardó, pero no se pudo publicar." };
  }

  return { ok: true, slug: campana.slug };
}
