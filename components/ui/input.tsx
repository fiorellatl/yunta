import type { ComponentProps } from "react";

const base =
  "w-full rounded-talon-sm border-2 border-tinta-15 bg-papel-alto outline-none placeholder:text-tinta-45 focus:border-anil";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={[base, "h-14 px-4 text-lg", className].filter(Boolean).join(" ")} {...props} />;
}

/** Entrada grande para una sola cifra: precio, cantidad. */
export function InputCifra({
  prefijo,
  sufijo,
  className,
  ...props
}: ComponentProps<"input"> & { prefijo?: string; sufijo?: string }) {
  return (
    <div className={["flex items-center gap-2 rounded-talon-sm border-2 border-tinta-15 bg-papel-alto px-4 focus-within:border-anil", className].filter(Boolean).join(" ")}>
      {prefijo && <span className="font-mono text-2xl text-tinta-45">{prefijo}</span>}
      <input
        inputMode="numeric"
        className="h-16 min-w-0 flex-1 bg-transparent cifra text-4xl outline-none placeholder:text-tinta-15"
        {...props}
      />
      {sufijo && <span className="text-tinta-45">{sufijo}</span>}
    </div>
  );
}
