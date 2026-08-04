import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Un Route Handler solo puede exportar los nombres que Next reserva,
// así que esta constante se queda dentro del módulo.
const COOKIE_PUBLICAR = "yunta_publicar";

/**
 * Vuelta del enlace de acceso o de Google.
 *
 * A dónde va después se decide con una cookie y no con un `?next=`: la
 * lista de Redirect URLs de Supabase compara la URL completa, y agregarle
 * query string la hacía fallar en silencio.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const galletas = await cookies();
  const vieneDeCrear = galletas.get(COOKIE_PUBLICAR)?.value === "1";
  const destino = vieneDeCrear ? "/crear" : "/app";

  if (vieneDeCrear) galletas.delete(COOKIE_PUBLICAR);

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
