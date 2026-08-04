import { ImageResponse } from "next/og";
import { obtenerCampana } from "@/lib/data/campanas";
import { PALETAS } from "@/lib/domain/campana";

export const alt = "Campaña en Yunta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Las mismas listas del telar que rematan la portada en la app.
const LISTAS: [number, string][] = [
  [6, "#C4183C"], [1, "#FFE600"], [2, "#2A3FA6"], [1, "#F6F4EF"],
  [4, "#0F8F70"], [1, "#FF2E93"], [3, "#E0A01A"], [1, "#131A33"],
  [2, "#0B7D8C"], [1, "#FFE600"], [5, "#FF6B2C"], [1, "#F6F4EF"],
];

const soles = (n: number) =>
  "S/ " + new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 }).format(n);

/**
 * next/og no aplica pesos si no le pasas el archivo de fuente: sin esto,
 * todo sale en un regular delgado por más que se pida 800.
 */
async function cargarArchivo(peso: 400 | 800) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Archivo:wght@${peso}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());

    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;

    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null; // sin fuente propia la imagen igual se genera
  }
}

/**
 * La imagen que WhatsApp, Instagram y Facebook muestran al pegar el enlace.
 * Es lo primero que ve alguien que nunca oyó de la campaña, así que dice
 * las tres cosas que importan: para qué es, cuánto lleva y cuánto cuesta.
 */
export default async function Image({ params }: { params: { slug: string } }) {
  const c = await obtenerCampana(params.slug);

  const causa = c?.goal_title ?? "Una causa que necesita tu ayuda";
  const p = PALETAS[c?.cover_palette ?? 0];
  const precio = c ? Number(c.price_per_number) : 0;
  const meta = c?.goal_amount ? Number(c.goal_amount) : null;
  const maximo = c ? precio * c.total_numbers : 0;
  const referencia = meta ?? maximo;
  const avance = c && referencia ? Math.min(100, (c.recaudado / referencia) * 100) : 0;
  const total = LISTAS.reduce((s, [w]) => s + w, 0);

  const [regular, negrita] = await Promise.all([cargarArchivo(400), cargarArchivo(800)]);
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
        {/* Orillo del telar */}
        <div style={{ display: "flex", height: 22, width: "100%" }}>
          {Array.from({ length: 5 }, () => LISTAS)
            .flat()
            .map(([ancho, color], i) => (
              <div
                key={i}
                style={{ width: `${(ancho / (total * 5)) * 100}%`, background: color }}
              />
            ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: p.tinta,
                color: p.fondo,
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Estamos juntando para
            </div>

            <div
              style={{
                marginTop: 28,
                fontSize: causa.length > 46 ? 68 : 88,
                fontWeight: 800,
                lineHeight: 1.03,
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {causa}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* El marcador */}
            <div
              style={{
                display: "flex",
                height: 16,
                width: "100%",
                marginTop: 8,
                background: "rgba(0,0,0,0.22)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.max(avance, 2)}%`,
                  background: "#0F8F70",
                  display: "flex",
                }}
              />
            </div>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 26, opacity: 0.85 }}>
                  {c ? `${soles(c.recaudado)} de ${soles(referencia)}` : "Súmate"}
                </span>
                <span style={{ fontSize: 46, fontWeight: 800, marginTop: 6 }}>
                  {c
                    ? `${c.total_numbers - c.vendidos.length} números libres`
                    : "Elige tu número"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span style={{ fontSize: 24, opacity: 0.85 }}>Cada número</span>
                <span
                  style={{
                    fontSize: 72,
                    fontWeight: 800,
                    background: p.acento,
                    color: p.fondo,
                    padding: "6px 22px",
                    borderRadius: 10,
                    marginTop: 6,
                  }}
                >
                  {soles(precio)}
                </span>
              </div>
            </div>

            <span style={{ marginTop: 26, fontSize: 26, opacity: 0.8 }}>
              Yunta · {c?.organizador ?? "una campaña"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", height: 22, width: "100%" }}>
          {Array.from({ length: 5 }, () => LISTAS)
            .flat()
            .map(([ancho, color], i) => (
              <div
                key={i}
                style={{ width: `${(ancho / (total * 5)) * 100}%`, background: color }}
              />
            ))}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
