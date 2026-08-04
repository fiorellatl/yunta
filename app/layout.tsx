import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Instrument_Sans } from "next/font/google";
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

// Geométrica y sin remates: las cifras son el dato más leído del producto.
const tecnica = Geist_Mono({
  variable: "--font-tecnica",
  subsets: ["latin"],
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
        className={`${bricolage.variable} ${instrument.variable} ${tecnica.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
