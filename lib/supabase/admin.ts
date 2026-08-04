import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente con la clave secreta: se salta las políticas RLS.
 * Úsalo solo para leer comprobantes de pago (URLs firmadas) y tareas
 * administrativas. Nunca en código que llegue al navegador.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
