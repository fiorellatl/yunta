import type { Metadata } from "next";
import {
  Archivo,
  Bricolage_Grotesque,
  Geist_Mono,
  Instrument_Sans,
} from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

// Solo para códigos y hashes: lo único que de verdad es código.
const tecnica = Geist_Mono({
  variable: "--font-tecnica",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Las cifras: Archivo con su eje de ancho abierto.
 * Expandida y pesada, se lee como número impreso en un boleto —ancho,
 * plantado, hecho para verse de lejos— y no como texto de interfaz.
 */
const cifras = Archivo({
  variable: "--font-cifras",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/**
 * De dónde sale la URL absoluta de las imágenes de vista previa.
 *
 * Sin `metadataBase`, Next emite `http://localhost:3000` y WhatsApp no
 * puede traer la imagen: el enlace se pega sin nada. Y una variable mal
 * configurada apuntando a localhost rompe lo mismo en silencio, así que
 * en producción se descarta y se cae a la URL que Netlify inyecta sola.
 */
function urlDelSitio() {
  const candidatas = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.URL, // Netlify la define en cada build
    "https://yuntaz.netlify.app",
  ];

  const enProduccion = process.env.NODE_ENV === "production";

  for (const url of candidatas) {
    if (!url) continue;
    if (enProduccion && url.includes("localhost")) continue;
    return url;
  }

  return "http://localhost:3007";
}

export const metadata: Metadata = {
  metadataBase: new URL(urlDelSitio()),
  title: "Yunta · Toda causa merece una oportunidad",
  description:
    "Crea tu campaña, compártela por WhatsApp y recauda con total transparencia. El dinero llega directo a tu Yape.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE">
      <body
        className={`${bricolage.variable} ${instrument.variable} ${tecnica.variable} ${cifras.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
