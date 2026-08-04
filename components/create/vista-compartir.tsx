import { PortadaCampana } from "@/components/create/portada-campana";
import { money } from "@/lib/format";
import { enFrase } from "@/lib/domain/texto";

/**
 * Cómo se va a ver la campaña cuando la manden por WhatsApp.
 *
 * Es la pieza que faltaba: durante todo el armado el organizador ve
 * pantallas de producto, nunca la cosa que de verdad va a compartir con
 * su familia. Sin esto, crear una campaña se siente como llenar un
 * formulario y no como preparar algo para mandar.
 *
 * No es una foto del mensaje real: es la misma composición que genera la
 * imagen de vista previa, montada en una burbuja de chat.
 */
export function VistaCompartir({
  causa,
  meta,
  precio,
  organizador,
  foto,
  paleta,
}: {
  causa: string;
  meta: number | null;
  precio: number;
  organizador: string;
  foto?: string | null;
  paleta?: number;
}) {
  const nombre = organizador.trim().split(" ")[0] || "alguien";
  const mensaje = `Estamos juntando para ${enFrase(causa || "nuestra causa")}. Elige tu número acá:`;

  return (
    <div className="rounded-talon bg-[#E6DDD3] p-4">
      <p className="mb-3 text-center text-[0.7rem] font-medium uppercase tracking-wider text-tinta-45">
        Así le va a llegar a tu familia
      </p>

      {/* Burbuja de chat */}
      <div className="ml-auto max-w-[19rem] rounded-xl rounded-tr-sm bg-[#DCF8C6] p-1.5 shadow-sm">
        {/* La tarjeta del enlace */}
        <div className="overflow-hidden rounded-lg bg-papel-alto">
          <PortadaCampana
            causa={causa || "Tu campaña"}
            meta={meta}
            foto={foto}
            paleta={paleta}
            className="rounded-none"
          />
          <div className="px-3 py-2">
            <p className="truncate text-[0.8rem] font-semibold text-tinta">
              {causa || "Tu campaña"}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[0.72rem] leading-snug text-tinta-70">
              Cada número cuesta {money(precio)}. Súmate a la causa de {nombre}.
            </p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-wide text-tinta-45">
              yunta
            </p>
          </div>
        </div>

        <p className="px-2 py-1.5 text-[0.8rem] leading-snug text-tinta">{mensaje}</p>
        <p className="px-2 pb-1 text-right text-[0.6rem] text-tinta-45">✓✓</p>
      </div>
    </div>
  );
}
