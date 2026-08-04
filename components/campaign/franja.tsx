/**
 * Franja de listas.
 *
 * Inspirada en los telares del Cusco: lo que se toma no es el motivo sino la
 * estructura —franjas verticales de anchos desiguales, color saturado, una
 * secuencia que se repite—. Funciona como el orillo de una manta: remata una
 * pieza, no rellena un fondo.
 *
 * Regla: aparece en el borde de una superficie, nunca detrás de texto.
 */

// Anchos y colores en secuencia fija: ancho-angosto-angosto-ancho, como el
// pallay entre campos planos. Se repite hasta llenar el ancho disponible.
const LISTAS: [number, string][] = [
  [6, "#C4183C"],
  [1, "#FFE600"],
  [2, "#2A3FA6"],
  [1, "#F6F4EF"],
  [4, "#0F8F70"],
  [1, "#FF2E93"],
  [3, "#E0A01A"],
  [1, "#131A33"],
  [2, "#0B7D8C"],
  [1, "#FFE600"],
  [5, "#FF6B2C"],
  [1, "#F6F4EF"],
];

export function Franja({
  alto = 6,
  repeticiones = 6,
  className,
}: {
  alto?: number;
  repeticiones?: number;
  className?: string;
}) {
  const secuencia = Array.from({ length: repeticiones }, () => LISTAS).flat();
  const total = secuencia.reduce((s, [w]) => s + w, 0);

  return (
    <div
      className={["flex w-full overflow-hidden", className].filter(Boolean).join(" ")}
      style={{ height: alto }}
      aria-hidden="true"
    >
      {secuencia.map(([ancho, color], i) => (
        <span
          key={i}
          style={{ width: `${(ancho / total) * 100}%`, background: color }}
        />
      ))}
    </div>
  );
}
