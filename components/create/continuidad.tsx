"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moneyCorto } from "@/lib/format";

/**
 * El momento de guardar, no el momento de "iniciar sesión".
 *
 * Llega después de armar la campaña completa, así que no pide un
 * compromiso a ciegas: explica qué se va a guardar y por qué hace falta
 * un nombre detrás. Los términos se aceptan acá, junto al botón, cuando
 * la persona ya decidió publicar.
 */
export function Continuidad({
  causa,
  meta,
  correoSesion,
  terminos,
  onTerminos,
  onPublicar,
  onAtras,
  onAntesDeSalir,
  error,
  publicando,
}: {
  causa: string;
  meta: number;
  correoSesion: string | null;
  terminos: boolean;
  onTerminos: (v: boolean) => void;
  onPublicar: () => void;
  onAtras: () => void;
  /** Guarda el borrador y lo marca pendiente antes de salir a autenticarse. */
  onAntesDeSalir: () => Promise<void>;
  error: string | null;
  publicando: boolean;
}) {
  const [conCorreo, setConCorreo] = useState(false);
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  /** Le dice al callback que vuelva a /crear en vez de al panel. */
  function marcarRegresoACrear() {
    document.cookie = "yunta_publicar=1; path=/; max-age=1800; SameSite=Lax";
  }

  async function conGoogle() {
    if (!terminos) return;
    setOcupado(true);
    await onAntesDeSalir();
    marcarRegresoACrear();

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErrorAuth("No pudimos abrir Google. Prueba con tu correo.");
      setOcupado(false);
    }
  }

  async function enviarEnlace(e: React.FormEvent) {
    e.preventDefault();
    if (!terminos) return;
    setOcupado(true);
    setErrorAuth(null);
    await onAntesDeSalir();
    marcarRegresoACrear();

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: correo,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setOcupado(false);
    if (error) {
      setErrorAuth(
        error.status === 429
          ? "Pediste varios enlaces seguidos. Espera unos minutos."
          : "No pudimos enviar el correo. Inténtalo de nuevo.",
      );
    } else {
      setEnviado(true);
    }
  }

  if (enviado) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
        <span className="sello self-start text-chilca">Enlace enviado</span>
        <h1 className="mt-5 text-[clamp(1.9rem,6.5vw,2.5rem)]">Revisa tu correo</h1>
        <p className="mt-4 leading-relaxed text-tinta-70">
          Le mandamos un enlace a <span className="font-medium">{correo}</span>.
        </p>

        <div className="mt-6 rounded-talon border-2 border-tara bg-tara-suave p-5">
          <p className="font-medium">Ábrelo en este mismo navegador</p>
          <p className="mt-2 text-sm leading-relaxed text-tinta-70">
            Tu campaña está guardada acá, en este dispositivo. Si abres el enlace en
            otro teléfono vas a entrar, pero tu campaña se queda de este lado.
          </p>
        </div>

        <p className="mt-6 text-sm text-tinta-70">
          Al volver, publicamos tu campaña sola. No tienes que hacer nada más.
        </p>

        <button
          type="button"
          onClick={() => setEnviado(false)}
          className="mt-8 text-sm font-medium text-tinta-45 hover:text-tinta"
        >
          Usar otro correo
        </button>
      </main>
    );
  }

  const bloqueado = !terminos || ocupado || publicando;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <button
        type="button"
        onClick={onAtras}
        className="self-start text-sm font-medium text-tinta-45 hover:text-tinta"
      >
        ← Revisar mi campaña
      </button>

      <h1 className="mt-6 text-[clamp(2rem,7vw,2.75rem)]">Tu campaña está lista.</h1>
      <p className="mt-4 leading-relaxed text-tinta-70">
        Ahora vamos a guardarla para que puedas compartirla y administrarla.
      </p>

      <div className="mt-6 rounded-talon bg-anil-suave px-5 py-4">
        <p className="font-display text-lg font-bold leading-tight">{causa}</p>
        <p className="mt-1 text-sm text-tinta-70">
          Meta de <span className="cifra">{moneyCorto(meta)}</span>
        </p>
      </div>

      {/* Los términos, junto al botón, en el momento de decidir */}
      <label className="mt-7 flex items-start gap-3">
        <input
          type="checkbox"
          checked={terminos}
          onChange={(e) => onTerminos(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--anil)]"
        />
        <span className="text-sm leading-relaxed text-tinta-70">
          Esta campaña es mía. Yo entrego los premios y respondo por ella ante quienes
          me apoyen. Acepto los{" "}
          <Link
            href="/legal/terminos"
            target="_blank"
            className="text-anil underline underline-offset-4"
          >
            términos y condiciones
          </Link>
          .
        </span>
      </label>

      {(errorAuth || error) && (
        <p role="alert" className="mt-4 rounded-talon-sm bg-cochinilla-suave px-4 py-3 text-sm">
          {errorAuth ?? error}
        </p>
      )}

      {/* Con sesión abierta no hay nada que preguntar: solo publicar. */}
      {correoSesion ? (
        <div className="mt-6">
          <Button
            tamano="lg"
            className="w-full"
            disabled={bloqueado}
            onClick={onPublicar}
          >
            {publicando ? "Publicando…" : "Publicar mi campaña"}
          </Button>
          <p className="mt-3 text-center text-sm text-tinta-45">
            Se guarda en tu cuenta <span className="font-medium">{correoSesion}</span>
          </p>
        </div>
      ) : conCorreo ? (
        <form onSubmit={enviarEnlace} className="mt-6">
          <label className="block text-sm font-medium">Tu correo</label>
          <Input
            autoFocus
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="nombre@correo.com"
            autoComplete="email"
            className="mt-2"
          />
          <Button type="submit" tamano="lg" className="mt-4 w-full" disabled={bloqueado}>
            {ocupado ? "Enviando…" : "Enviarme el enlace"}
          </Button>
          <button
            type="button"
            onClick={() => setConCorreo(false)}
            className="mt-3 w-full text-sm font-medium text-tinta-45 hover:text-tinta"
          >
            Mejor con Google
          </button>
        </form>
      ) : (
        <div className="mt-6">
          <Button tamano="lg" className="w-full" disabled={bloqueado} onClick={conGoogle}>
            Continuar con Google
          </Button>
          <button
            type="button"
            onClick={() => setConCorreo(true)}
            disabled={!terminos}
            className="mt-3 w-full text-sm font-medium text-tinta-45 hover:text-tinta disabled:opacity-50"
          >
            o con tu correo
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-sm leading-relaxed text-tinta-45">
        Guardamos tu campaña a tu nombre para que solo tú puedas aprobar los pagos y
        hacer el sorteo.
      </p>
    </main>
  );
}
