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

export const metadata: Metadata = {
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
