import { ordinal } from "@/lib/domain/campana";
import { capitalizar } from "@/lib/domain/texto";

export type PremioVisible = {
  id?: string;
  position: number;
  name: string;
  image_url?: string | null;
};

// El primer premio manda: es el que hace que alguien compre.
const TONOS: Record<number, { borde: string; chip: string; texto: string }> = {
  1: { borde: "border-tara", chip: "bg-tara text-tinta", texto: "text-tinta" },
  2: { borde: "border-tinta-15", chip: "bg-tinta-15 text-tinta", texto: "text-tinta" },
  3: { borde: "border-tinta-15", chip: "bg-tinta-15 text-tinta", texto: "text-tinta" },
};

/**
 * El podio. Los premios dejan de ser una lista de texto y pasan a ocupar
 * el espacio que merecen: el primero grande, los demás en fila.
 * Es lo que convierte "estoy donando" en "estoy jugando".
 */
export function Podio({ premios }: { premios: PremioVisible[] }) {
  if (!premios.length) return null;

  // También al mostrar, no solo al guardar: así se ven cuidadas las
  // campañas creadas antes de que existiera la normalización.
  const [primero, ...resto] = [...premios]
    .sort((a, b) => a.position - b.position)
    .map((p) => ({ ...p, name: capitalizar(p.name) }));
  const tono = TONOS[primero.position] ?? TONOS[3];

  return (
    <div>
      {/* Primer premio: tarjeta grande con su imagen */}
      <div className={`overflow-hidden rounded-talon border-2 ${tono.borde} bg-papel-alto`}>
        <div className="relative aspect-[16/10] w-full bg-tara-suave">
          {primero.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primero.image_url}
              alt={primero.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6">
              <p className="cifra text-center text-[clamp(1.3rem,6vw,2rem)] uppercase leading-tight text-tinta">
                {primero.name}
              </p>
            </div>
          )}
          <span
            className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${tono.chip}`}
          >
            {ordinal(primero.position)} premio
          </span>
        </div>

        {primero.image_url && (
          <p className="px-4 py-3 font-medium">{primero.name}</p>
        )}
      </div>

      {/* Los demás, en fila */}
      {resto.length > 0 && (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {resto.map((p) => (
            <li
              key={p.id ?? p.position}
              className="flex items-center gap-3 rounded-talon-sm border-2 border-tinta-15 bg-papel-alto p-3"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-anil-suave">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="cifra text-sm text-anil">{p.position}°</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-tinta-45">
                  {ordinal(p.position)} premio
                </span>
                <span className="mt-0.5 block truncate font-medium">{p.name}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
