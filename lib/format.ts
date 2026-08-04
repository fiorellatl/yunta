const soles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const solesRedondos = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

/** S/ 1,234.50 */
export function money(monto: number) {
  return soles.format(monto);
}

/** S/ 1,235 — para cifras grandes donde los céntimos estorban. */
export function moneyCorto(monto: number) {
  return solesRedondos.format(monto);
}

/** "domingo 16 de agosto" */
export function fechaLarga(fecha: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Lima",
  }).format(fecha);
}

/**
 * Fecha en formato yyyy-mm-dd para <input type="date">, en hora local.
 * Con toISOString() la fecha se adelantaba un día después de las 19:00 en Lima.
 */
export function fechaInput(fecha: Date) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/**
 * Días completos entre hoy y una fecha yyyy-mm-dd, ambos a medianoche local.
 * Sin normalizar los dos extremos, "en 2 semanas" contaba 15 días.
 */
export function diasHasta(fecha: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [a, m, d] = fecha.split("-").map(Number);
  const destino = new Date(a, m - 1, d);
  return Math.max(0, Math.round((destino.getTime() - hoy.getTime()) / 86400000));
}

export function sumarDias(dias: number, desde = new Date()) {
  const f = new Date(desde);
  f.setDate(f.getDate() + dias);
  return f;
}

/** Teléfono peruano: 9 dígitos que empiezan en 9. */
export function telefonoValido(valor: string) {
  return /^9\d{8}$/.test(valor.replace(/\s/g, ""));
}

export function formatearTelefono(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 9);
  return d.replace(/(\d{3})(\d{3})(\d{0,3})/, (_, a, b, c) =>
    c ? `${a} ${b} ${c}` : `${a} ${b}`,
  );
}
