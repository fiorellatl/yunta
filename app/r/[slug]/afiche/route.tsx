import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { obtenerCampana } from "@/lib/data/campanas";
import { PALETAS } from "@/lib/domain/campana";
import { capitalizar } from "@/lib/domain/texto";

/**
 * El afiche de la rifa, listo para descargar y subir a redes.
 *
 * Es el producto que la gente ya hace a mano en Canva o Word: la causa
 * arriba, la lista de premios en el centro, el precio grande y la fecha
 * del sorteo. Yunta lo arma con lo que ya escribió el organizador.
 *
 * Lleva QR porque en Instagram no se puede tocar un enlace: sin eso, el
 * afiche se ve lindo y no lleva a ningún lado.
 *
 *   /r/[slug]/afiche              → 1080×1350, para feed y WhatsApp
 *   /r/[slug]/afiche?formato=historia → 1080×1920, para historias
 */

const LISTAS: [number, string][] = [
  [6, "#C4183C"], [1, "#FFE600"], [2, "#2A3FA6"], [1, "#F6F4EF"],
  [4, "#0F8F70"], [1, "#FF2E93"], [3, "#E0A01A"], [1, "#131A33"],
  [2, "#0B7D8C"], [1, "#FFE600"], [5, "#FF6B2C"], [1, "#F6F4EF"],
];
const ANCHO_LISTAS = LISTAS.reduce((s, [w]) => s + w, 0);

const soles = (n: number) =>
  "S/ " + new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 }).format(n);

async function cargarArchivo(peso: 400 | 800) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Archivo:wght@${peso}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

function Franja({ alto, repeticiones }: { alto: number; repeticiones: number }) {
  return (
    <div style={{ display: "flex", width: "100%", height: alto }}>
      {Array.from({ length: repeticiones }, () => LISTAS)
        .flat()
        .map(([ancho, color], i) => (
          <div
            key={i}
            style={{
              width: `${(ancho / (ANCHO_LISTAS * repeticiones)) * 100}%`,
              background: color,
            }}
          />
        ))}
    </div>
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const c = await obtenerCampana(slug);

  if (!c) return new Response("Campaña no encontrada", { status: 404 });

  const { searchParams, origin } = new URL(request.url);
  const historia = searchParams.get("formato") === "historia";
  const size = historia ? { width: 1080, height: 1920 } : { width: 1080, height: 1350 };

  const enlace = `${origin}/r/${c.slug}`;
  const precio = Number(c.price_per_number);
  const meta = c.goal_amount ? Number(c.goal_amount) : null;
  const p = PALETAS[c.cover_palette ?? 0];
  const nombre = c.organizador.trim().split(" ")[0];

  const premios = [...c.prizes]
    .sort((a, b) => a.position - b.position)
    .map((x) => capitalizar(x.name));

  // La lista es el corazón del afiche: el tamaño se ajusta a cuántos
  // premios haya, para que entren todos sin recortar ninguno.
  const alturaLista = historia ? 900 : 560;
  const tamPremio = Math.max(
    22,
    Math.min(40, Math.floor(alturaLista / Math.max(premios.length, 1)) - 8),
  );

  const fecha = c.draw_date
    ? new Intl.DateTimeFormat("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "America/Lima",
      }).format(new Date(c.draw_date))
    : null;

  const [qr, regular, negrita] = await Promise.all([
    QRCode.toDataURL(enlace, { margin: 1, width: 240, color: { dark: "#131A33", light: "#FFFFFF" } }),
    cargarArchivo(400),
    cargarArchivo(800),
  ]);

  const fonts = [
    regular && { name: "Archivo", data: regular, weight: 400 as const, style: "normal" as const },
    negrita && { name: "Archivo", data: negrita, weight: 800 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 800; style: "normal" }[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: p.fondo,
          color: p.tinta,
          fontFamily: fonts.length ? "Archivo" : "sans-serif",
        }}
      >
        <Franja alto={historia ? 26 : 22} repeticiones={5} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: historia ? "56px 64px" : "44px 64px",
          }}
        >
          {/* La causa manda */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: p.tinta,
                color: p.fondo,
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Rifa a beneficio de
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: c.goal_title.length > 40 ? 62 : 78,
                fontWeight: 800,
                lineHeight: 1.02,
                textTransform: "uppercase",
              }}
            >
              {c.goal_title}
            </div>

            {meta && (
              <div style={{ display: "flex", marginTop: 16, fontSize: 30, opacity: 0.85 }}>
                Meta: {soles(meta)} · organiza {nombre}
              </div>
            )}
          </div>

          {/* Los premios: lo que hace que alguien compre */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 34,
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "26px 30px",
              color: "#131A33",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#7A819A",
              }}
            >
              {premios.length === 1 ? "El premio" : `${premios.length} premios`}
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
              {premios.map((nombrePremio, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    fontSize: tamPremio,
                    lineHeight: 1.35,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      width: 54,
                      fontWeight: 800,
                      color: p.fondo,
                    }}
                  >
                    {i + 1}°
                  </span>
                  <span style={{ display: "flex" }}>{nombrePremio}</span>
                </div>
              ))}
            </div>
          </div>

          {/* El aire sobrante se reparte arriba y abajo del bloque del medio:
              así nunca queda un hueco solo, se ve compuesto. */}
          <div style={{ display: "flex", flex: 1, minHeight: 24 }} />

          {c.story && premios.length <= 12 ? (
            // La historia es lo que convierte un cartel de premios en una causa.
            <div
              style={{
                display: "flex",
                fontSize: premios.length > 6 ? 28 : 34,
                lineHeight: 1.4,
                opacity: 0.92,
              }}
            >
              {c.story.length > 320 ? c.story.slice(0, 317) + "…" : c.story}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 800,
                lineHeight: 1.25,
                opacity: 0.9,
              }}
            >
              {c.total_numbers - c.vendidos.length} números todavía libres.
              {"\n"}Elige el tuyo y apóyanos.
            </div>
          )}

          <div style={{ display: "flex", flex: 1, minHeight: 24 }} />

          {/* Precio, fecha y por dónde entrar */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 26, opacity: 0.85 }}>Cada número</span>
              <span
                style={{
                  display: "flex",
                  fontSize: 96,
                  fontWeight: 800,
                  background: p.acento,
                  color: p.fondo,
                  padding: "4px 26px",
                  borderRadius: 12,
                  marginTop: 6,
                }}
              >
                {soles(precio)}
              </span>
              <span style={{ fontSize: 28, marginTop: 12, fontWeight: 800 }}>
                Yape / Plin
              </span>
              {fecha && (
                <span style={{ fontSize: 26, marginTop: 10, opacity: 0.85 }}>
                  Sorteo: {fecha}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="" width={190} height={190} style={{ borderRadius: 10 }} />
              <span style={{ fontSize: 22, marginTop: 10, opacity: 0.85 }}>
                Escanea y elige tu número
              </span>
            </div>
          </div>
        </div>

        <Franja alto={historia ? 26 : 22} repeticiones={5} />
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
