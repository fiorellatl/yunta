import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Vuelta del enlace de acceso que llega por correo.
 *
 * Supabase manda el enlace de dos formas según la plantilla del proyecto:
 * con `code` (flujo PKCE) o con `token_hash` + `type`. Aceptamos las dos,
 * porque cuál llega depende de una configuración que no vive en este repo.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Sin query string en el `redirect_to`: la lista de Redirect URLs de
  // Supabase compara la URL completa, y un `?next=` la hacía fallar en
  // silencio, devolviendo al Site URL en vez de acá.
  const destino = "/app";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }

  return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
}
