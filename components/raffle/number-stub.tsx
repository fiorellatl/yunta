export type EstadoNumero = "disponible" | "reservado" | "vendido";

const estilos: Record<EstadoNumero, string> = {
  disponible: "bg-papel-alto text-tinta border-tinta-15 hover:border-anil",
  reservado: "bg-tara-suave text-tinta border-tara",
  vendido: "bg-chilca-suave text-chilca border-chilca",
};

/**
 * El talón: la unidad mínima del producto. Un número de la rifa,
 * con el mismo aspecto en la grilla del organizador y en la del comprador.
 */
export function NumberStub({
  numero,
  estado = "disponible",
  seleccionado = false,
  digitos = 2,
}: {
  numero: number;
  estado?: EstadoNumero;
  seleccionado?: boolean;
  digitos?: number;
}) {
  return (
    <span
      className={[
        "cifra flex aspect-square items-center justify-center rounded-talon-sm border-2 text-[0.95rem] transition-colors",
        seleccionado
          ? "border-anil bg-anil text-white"
          : estilos[estado],
      ].join(" ")}
    >
      {String(numero).padStart(digitos, "0")}
    </span>
  );
}
