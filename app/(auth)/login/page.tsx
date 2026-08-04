"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Estado = { tipo: "listo" | "enviando" | "enviado" | "error"; mensaje?: string };

/**
 * Un error de acceso tiene que decir qué pasó y qué hacer. "Revisa la
 * dirección" mandaba a corregir un correo que estaba bien, cuando el
 * problema real era el límite de envíos.
 */
function mensajeDeError(error: { code?: string; status?: number; message?: string }) {
  const codigo = error.code ?? "";

  if (codigo.includes("rate_limit") || error.status === 429) {
    return "Pediste varios enlaces seguidos y llegamos al límite de envíos. Espera unos minutos y vuelve a intentar.";
  }
  if (codigo.includes("email_address_invalid") || codigo.includes("validation")) {
    return "Esa dirección no parece válida. Revísala e inténtalo otra vez.";
  }
  if (codigo.includes("signup_disabled")) {
    return "Por ahora el acceso está cerrado. Escríbenos para entrar al piloto.";
  }
  return "No pudimos enviar el correo. Inténtalo de nuevo en un momento.";
}

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<Estado>({ tipo: "listo" });

  // Si el enlace del correo no sirvió, hay que decirlo: caer callado en la
  // pantalla de acceso se siente como un bucle sin explicación.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error")) {
      setEstado({
        tipo: "error",
        mensaje:
          "Ese enlace ya venció o se abrió en otro navegador. Pide uno nuevo y ábrelo en este mismo dispositivo.",
      });
    }
  }, []);

  async function enviarEnlace(e: React.FormEvent) {
    e.preventDefault();
    setEstado({ tipo: "enviando" });

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: correo,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setEstado(error ? { tipo: "error", mensaje: mensajeDeError(error) } : { tipo: "enviado" });
  }

  async function entrarConGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="font-display text-2xl font-extrabold tracking-tight">
        Yunta
      </Link>

      <div className="mt-8 rounded-talon border border-tinta-15 bg-papel-alto p-7">
        {estado.tipo === "enviado" ? (
          <>
            <h1 className="text-3xl">Revisa tu correo</h1>
            <p className="mt-3 leading-relaxed text-tinta-70">
              Te mandamos un enlace a <span className="font-medium">{correo}</span>. Ábrelo
              desde este mismo dispositivo y entras directo.
            </p>
            <button
              onClick={() => setEstado({ tipo: "listo" })}
              className="mt-6 text-sm font-medium text-anil underline underline-offset-4"
            >
              Usar otro correo
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl">Entra a Yunta</h1>
            <p className="mt-3 leading-relaxed text-tinta-70">
              Te enviamos un enlace de acceso. No necesitas contraseña.
            </p>

            <form onSubmit={enviarEnlace} className="mt-7">
              <label htmlFor="correo" className="block text-sm font-medium">
                Tu correo
              </label>
              <input
                id="correo"
                type="email"
                required
                autoComplete="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="nombre@correo.com"
                className="mt-2 h-12 w-full rounded-talon-sm border-2 border-tinta-15 bg-papel-alto px-4 outline-none placeholder:text-tinta-45 focus:border-anil"
              />

              {estado.tipo === "error" && (
                <p className="mt-3 text-sm text-cochinilla">{estado.mensaje}</p>
              )}

              <Button
                type="submit"
                tamano="lg"
                className="mt-5 w-full"
                disabled={estado.tipo === "enviando"}
              >
                {estado.tipo === "enviando" ? "Enviando…" : "Enviar enlace"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="linea-corte flex-1" />
              <span className="font-mono text-xs uppercase tracking-widest text-tinta-45">
                o
              </span>
              <div className="linea-corte flex-1" />
            </div>

            <Button
              variante="secundario"
              tamano="lg"
              className="w-full"
              onClick={entrarConGoogle}
            >
              Continuar con Google
            </Button>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-tinta-45">
        Al entrar aceptas los{" "}
        <Link href="/legal/terminos" className="underline underline-offset-4 hover:text-tinta">
          términos y condiciones
        </Link>
        .
      </p>
    </main>
  );
}
