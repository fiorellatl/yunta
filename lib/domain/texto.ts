/**
 * Normalización mínima de lo que escribe el organizador.
 *
 * No corrige ortografía ni reescribe: solo levanta la primera letra para
 * que el podio se vea cuidado sin pedirle trabajo extra a nadie. Si ya
 * escribió con mayúscula o empezó con un número, no se toca nada.
 */
export function capitalizar(texto: string) {
  const limpio = texto.trim();
  if (!limpio) return limpio;
  return limpio.charAt(0).toLocaleUpperCase("es-PE") + limpio.slice(1);
}
