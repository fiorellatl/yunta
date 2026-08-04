/**
 * Normalización mínima de lo que escribe el organizador.
 *
 * No corrige ortografía ni reescribe: solo levanta la primera letra para
 * que el podio se vea cuidado sin pedirle trabajo extra a nadie. Si ya
 * escribió con mayúscula o empezó con un número, no se toca nada.
 */
/**
 * Para meter la causa dentro de una frase: "Estamos juntando para {…}".
 * Solo baja la primera letra —un toLowerCase() entero convertía
 * "la 5.° B" en "la 5.° b" y arruinaba nombres propios y siglas.
 */
export function enFrase(texto: string) {
  const limpio = texto.trim();
  if (!limpio) return limpio;
  return limpio.charAt(0).toLocaleLowerCase("es-PE") + limpio.slice(1);
}

export function capitalizar(texto: string) {
  const limpio = texto.trim();
  if (!limpio) return limpio;
  return limpio.charAt(0).toLocaleUpperCase("es-PE") + limpio.slice(1);
}
