import { Franja } from "@/components/campaign/franja";

/**
 * El boleto de rifa de toda la vida: se rompe por la perforación, una
 * mitad se la queda quien compró y la otra va al ánfora. Acá no se rompe
 * nada, pero la forma cuenta esa historia sola —y es lo que hace que un
 * número comprado por internet se sienta un número de rifa.
 */
export function TicketTalon({
  numero,
  digitos,
  codigo,
  confirmado = false,
}: {
  numero: number;
  digitos: number;
  codigo: string;
  confirmado?: boolean;
}) {
  return (
    <div
      className={[
        "relative flex overflow-hidden rounded-talon-sm border-2",
        confirmado ? "border-chilca bg-chilca-suave" : "border-tara bg-tara-suave",
      ].join(" ")}
    >
      {/* Tu mitad: el número */}
      <div className="flex-1 px-4 py-3">
        <p className="text-[0.6rem] font-bold uppercase tracking-wider text-tinta-45">
          Tu número
        </p>
        <p className="cifra mt-0.5 text-4xl leading-none">
          {String(numero).padStart(digitos, "0")}
        </p>
        <p className="cifra mt-1 text-[0.65rem] text-tinta-45">{codigo}</p>
      </div>

      {/* La perforación */}
      <div
        className="w-0 border-l-2 border-dashed border-tinta-15"
        aria-hidden="true"
      />

      {/* La mitad que va al ánfora */}
      <div className="flex w-24 shrink-0 flex-col justify-between bg-papel-alto/60 px-3 py-3">
        <span className="text-[0.6rem] font-bold uppercase leading-tight tracking-wider text-tinta-45">
          Va al ánfora
        </span>
        <Franja alto={5} repeticiones={2} className="rounded-full" />
      </div>
    </div>
  );
}
