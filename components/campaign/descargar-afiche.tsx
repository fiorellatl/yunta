/**
 * Descarga del afiche.
 *
 * No intentamos compartir por el usuario: se baja la imagen y él la sube
 * a donde quiera. Es lo que la gente ya hace con los afiches que arma en
 * Word, y funciona igual en WhatsApp, Instagram o impreso en el mercado.
 */
export function DescargarAfiche({
  slug,
  causa,
  tono = "claro",
}: {
  slug: string;
  causa: string;
  tono?: "claro" | "oscuro";
}) {
  const archivo = `yunta-${slug}`;

  return (
    <div>
      <p className={tono === "oscuro" ? "text-papel" : "font-medium"}>
        Descarga tu afiche
      </p>
      <p
        className={`mt-1 text-sm leading-relaxed ${
          tono === "oscuro" ? "text-tinta-15" : "text-tinta-70"
        }`}
      >
        Con tu causa, tus premios y el precio. Lleva un código QR, así que sirve
        igual en una historia de Instagram que impreso.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a
          href={`/r/${slug}/afiche`}
          download={`${archivo}.png`}
          className="flex h-12 flex-1 items-center justify-center rounded-talon-sm bg-anil text-sm font-semibold text-white shadow-[0_2px_0_0_var(--anil-oscuro)] hover:bg-anil-oscuro"
        >
          Para WhatsApp
        </a>
        <a
          href={`/r/${slug}/afiche?formato=historia`}
          download={`${archivo}-historia.png`}
          className={`flex h-12 flex-1 items-center justify-center rounded-talon-sm border-2 text-sm font-semibold ${
            tono === "oscuro"
              ? "border-tinta-15 text-papel"
              : "border-tinta-15 text-tinta hover:border-anil"
          }`}
        >
          Para historias
        </a>
      </div>

      <p className="sr-only">Afiche de la campaña {causa}</p>
    </div>
  );
}
