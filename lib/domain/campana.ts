import { telefonoValido } from "@/lib/format";

export type Premio = {
  nombre: string;
  fotoPreview: string | null;
  /** El archivo se guarda para subirlo al publicar: la vista previa
   *  es una URL local que muere al cerrar la pestaña. */
  fotoArchivo: File | null;
};

export type BorradorCampana = {
  causa: string;              // "El viaje de promoción de la 5.° B"
  historia: string;           // opcional, pero es lo que hace que alguien comparta
  meta: number | null;        // opcional: puede no saberlo todavía
  metaOmitida: boolean;       // marcó "todavía no lo sé"
  portadaFoto: string | null; // vista previa local
  portadaArchivo: File | null; // el archivo que se sube al publicar
  portadaPaleta: number | null; // si eligió una portada distinta a la sugerida
  precio: number | null;
  cantidad: number | null;
  premios: Premio[];
  fechaSorteo: string;        // yyyy-mm-dd
  yape: string;
  titular: string;
  terminos: boolean;
};

export const BORRADOR_VACIO: BorradorCampana = {
  causa: "",
  historia: "",
  meta: null,
  metaOmitida: false,
  portadaFoto: null,
  portadaArchivo: null,
  portadaPaleta: null,
  precio: null,
  cantidad: null,
  premios: [{ nombre: "", fotoPreview: null, fotoArchivo: null }],
  fechaSorteo: "",
  yape: "",
  titular: "",
  terminos: false,
};

/** Cada paso es una pregunta. La causa primero; el mecanismo, después. */
export const PASOS = [
  "causa",
  "meta",
  "portada",
  "armado",
  "premios",
  "fecha",
  "cobro",
  "revisar",
] as const;

export type Paso = (typeof PASOS)[number];

// ── Portada tipográfica ─────────────────────────────────────
// Regla del sistema: la interfaz es sobria, las portadas son cartel.
// Acá sí entra la exuberancia del impreso popular peruano —el afiche
// chicha, tinta fluorescente sobre fondo oscuro— porque una portada
// compite por atención en un chat, no guía una tarea.
// La paleta se elige por el texto de la causa: siempre la misma.
//
// Regla de contraste: `tinta` sobre `fondo` es el único par garantizado para
// texto. `acento` es para masas —barras de ritmo, fondos de bloque— nunca para
// texto chico: amarillo sobre fucsia da 2.7:1 y no pasa el mínimo accesible.
export const PALETAS = [
  { fondo: "#2A3FA6", tinta: "#F6F4EF", acento: "#E0A01A" }, // añil
  { fondo: "#C4183C", tinta: "#F6F4EF", acento: "#E0A01A" }, // cochinilla
  { fondo: "#0F8F70", tinta: "#F6F4EF", acento: "#E0A01A" }, // chilca
  { fondo: "#E0A01A", tinta: "#131A33", acento: "#2A3FA6" }, // tara
  { fondo: "#131A33", tinta: "#F6F4EF", acento: "#C4183C" }, // tinta
  { fondo: "#2B0B3F", tinta: "#FFE600", acento: "#FF2E93" }, // chicha noche
  { fondo: "#FF2E93", tinta: "#1A0620", acento: "#FFE600" }, // chicha fucsia
  { fondo: "#0B7D8C", tinta: "#FFE600", acento: "#FF6B2C" }, // chicha turquesa
] as const;

export function paletaDe(texto: string) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h % PALETAS.length;
}

// ── La propuesta: Yunta hace las cuentas ────────────────────
export type Combo = { precio: number; cantidad: number };

const PRECIOS_POSIBLES = [2, 5, 10, 20, 50];

/** Redondea hacia arriba a una cifra que se vea intencional, no calculada. */
function redondear(n: number) {
  if (n <= 50) return Math.ceil(n / 10) * 10;
  if (n <= 200) return Math.ceil(n / 25) * 25;
  if (n <= 600) return Math.ceil(n / 50) * 50;
  return Math.ceil(n / 100) * 100;
}

/**
 * Dada una meta, propone combinaciones de precio y cantidad.
 * Ordena por cercanía a ~150 números: suficientes para juntar algo,
 * pocos como para venderlos entre conocidos.
 */
export function proponerCombos(meta: number): Combo[] {
  return PRECIOS_POSIBLES.map((precio) => ({
    precio,
    cantidad: redondear(meta / precio),
  }))
    .filter((c) => c.cantidad >= 20 && c.cantidad <= 2000)
    .sort((a, b) => Math.abs(a.cantidad - 150) - Math.abs(b.cantidad - 150))
    .slice(0, 3);
}

/** Cuando no hay meta, se arranca con algo razonable y editable. */
export const COMBO_POR_DEFECTO: Combo = { precio: 10, cantidad: 100 };

export function comboSugerido(b: BorradorCampana): Combo {
  if (!b.meta) return COMBO_POR_DEFECTO;
  return proponerCombos(b.meta)[0] ?? COMBO_POR_DEFECTO;
}

export function recaudacionMaxima(b: BorradorCampana) {
  if (!b.precio || !b.cantidad) return null;
  return b.precio * b.cantidad;
}

/** Diferencia entre lo que puede juntar y lo que necesita. */
export function contraMeta(b: BorradorCampana) {
  const total = recaudacionMaxima(b);
  if (!total || !b.meta) return null;
  return { total, meta: b.meta, diferencia: total - b.meta };
}

const ORDINALES = ["1.er", "2.°", "3.er", "4.°", "5.°", "6.°", "7.°", "8.°", "9.°", "10.°"];

/** "1.er", "2.°"… Vive en el dominio para que lo use servidor y cliente. */
export function ordinal(posicion: number) {
  return ORDINALES[posicion - 1] ?? `${posicion}.°`;
}

export function premiosValidos(premios: Premio[]) {
  return premios.filter((p) => p.nombre.trim().length > 0);
}

/** Numeración o viñeta al inicio de línea: "1.", "2)", "3.°", "-", "•", "*". */
const VINETA = /^\s*(?:\d+\s*[.)°-]?|[-–—•*])\s*/;

/** Una línea por premio: sirve para pegar una lista de golpe. */
export function premiosDesdeTexto(texto: string): Premio[] {
  return texto
    .split("\n")
    .map((l) => l.replace(VINETA, "").trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((nombre) => ({ nombre, fotoPreview: null, fotoArchivo: null }));
}

export function pasoCompleto(paso: Paso, b: BorradorCampana): boolean {
  switch (paso) {
    case "causa":
      return b.causa.trim().length >= 4;
    case "meta":
      return b.metaOmitida || (!!b.meta && b.meta > 0);
    case "portada":
      return true; // la tipográfica siempre está lista
    case "armado":
      return (
        !!b.precio && b.precio > 0 && !!b.cantidad && b.cantidad >= 2 && b.cantidad <= 2000
      );
    case "premios":
      return premiosValidos(b.premios).length >= 1;
    case "fecha":
      return b.fechaSorteo !== "";
    case "cobro":
      return telefonoValido(b.yape) && b.titular.trim().length >= 3;
    case "revisar":
      return b.terminos;
  }
}

const TILDES = new RegExp("[\\u0300-\\u036f]", "g");

/** "El viaje de promoción de la 5.° B" → "el-viaje-de-promocion-de-la-5-b-x7k2" */
export function generarSlug(causa: string, sufijo: string) {
  const base = causa
    .toLowerCase()
    .normalize("NFD")
    .replace(TILDES, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${base || "campana"}-${sufijo}`;
}
