"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Aprobar y rechazar pasan por las funciones de Postgres, no por updates
 * sueltos: ahí adentro se marcan los números como vendidos o se liberan,
 * en una sola transacción y comprobando que la campaña sea tuya.
 */
export async function aprobarOrden(ordenId: string, campanaId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_order", { p_order_id: ordenId });

  revalidatePath(`/app/campanas/${campanaId}`);
  return error ? { ok: false as const, mensaje: error.message } : { ok: true as const };
}

export async function rechazarOrden(
  ordenId: string,
  campanaId: string,
  motivo: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_order", {
    p_order_id: ordenId,
    p_reason: motivo,
  });

  revalidatePath(`/app/campanas/${campanaId}`);
  return error ? { ok: false as const, mensaje: error.message } : { ok: true as const };
}

/**
 * URL firmada para ver un comprobante. El bucket es privado a propósito:
 * son capturas de pagos, y solo el dueño de la campaña puede abrirlas.
 * Por eso la firma se hace acá, con la clave secreta, y vence en 5 minutos.
 */
export async function verComprobante(ordenId: string): Promise<string | null> {
  if (!process.env.SUPABASE_SECRET_KEY) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Comprobamos la propiedad con la sesión del organizador, no con la clave
  // secreta: si la orden no es de una campaña suya, RLS devuelve vacío.
  const { data: orden } = await supabase
    .from("orders")
    .select("proof_path")
    .eq("id", ordenId)
    .maybeSingle();

  if (!orden?.proof_path) return null;

  const admin = createAdminClient();
  const { data } = await admin.storage
    .from("payment-proofs")
    .createSignedUrl(orden.proof_path, 300);

  return data?.signedUrl ?? null;
}
