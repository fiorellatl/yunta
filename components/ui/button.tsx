import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variante = "primario" | "secundario" | "fantasma";
type Tamano = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-talon-sm transition-[transform,background-color,border-color] duration-150 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none";

const variantes: Record<Variante, string> = {
  primario:
    "bg-anil text-white hover:bg-anil-oscuro shadow-[0_2px_0_0_var(--anil-oscuro)] active:shadow-none",
  secundario:
    "bg-papel-alto text-tinta border-2 border-tinta-15 hover:border-anil",
  fantasma: "text-tinta-70 hover:text-tinta hover:bg-anil-suave",
};

const tamanos: Record<Tamano, string> = {
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-14 px-7 text-lg",
};

function clases(variante: Variante, tamano: Tamano, extra?: string) {
  return [base, variantes[variante], tamanos[tamano], extra]
    .filter(Boolean)
    .join(" ");
}

type ComunProps = {
  variante?: Variante;
  tamano?: Tamano;
  children: ReactNode;
  className?: string;
};

export function Button({
  variante = "primario",
  tamano = "md",
  className,
  children,
  ...props
}: ComunProps & ComponentProps<"button">) {
  return (
    <button className={clases(variante, tamano, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variante = "primario",
  tamano = "md",
  className,
  children,
  ...props
}: ComunProps & ComponentProps<typeof Link>) {
  return (
    <Link className={clases(variante, tamano, className)} {...props}>
      {children}
    </Link>
  );
}
