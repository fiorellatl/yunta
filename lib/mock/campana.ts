/**
 * Datos de ejemplo mientras no hay backend.
 * Todo lo que vive acá tiene la misma forma que las tablas `campaigns`,
 * `prizes` y `campaign_numbers`, así que conectar Supabase será cambiar
 * de dónde vienen los datos, no cómo se ven las pantallas.
 */

export type PremioPublico = { posicion: number; nombre: string };

export type CampanaPublica = {
  slug: string;
  causa: string;
  historia: string;
  organizador: string;
  organizadorVerificado: boolean;
  meta: number | null;
  precio: number;
  cantidad: number;
  vendidos: number[];
  reservados: number[];
  premios: PremioPublico[];
  fechaSorteo: string;
  yape: string;
  titular: string;
  selloHash: string;
};

const DEMO: CampanaPublica = {
  slug: "viaje-de-promocion-5b-x7k2",
  causa: "El viaje de promoción de la 5.° B",
  historia:
    "Somos 32 chicos de la promoción del colegio Santa Rosa, en Comas. Llevamos cinco años juntos y queremos cerrar el colegio con un viaje a Paracas. Entre todos ya pusimos lo que pudimos, pero nos falta para los pasajes y el hospedaje. Con cada número nos ayudas a llegar.",
  organizador: "María Quispe",
  organizadorVerificado: true,
  meta: 2000,
  precio: 10,
  cantidad: 200,
  vendidos: [3, 7, 8, 12, 15, 19, 23, 24, 27, 31, 34, 38, 41, 45, 46, 52, 58, 63, 67, 71, 74, 79, 83, 88, 91, 95, 99, 104, 112, 118, 123, 131, 140, 156],
  reservados: [5, 22, 60, 87, 102, 149],
  premios: [
    { posicion: 1, nombre: "Un televisor de 50 pulgadas" },
    { posicion: 2, nombre: "Una air fryer de 5 litros" },
    { posicion: 3, nombre: "Una canasta de víveres" },
  ],
  fechaSorteo: "2026-08-24",
  yape: "987654321",
  titular: "María Quispe",
  selloHash: "9f2c4a1b8e7d3f60a5c9b2e8d1f4a7c3",
};

export function campanaDemo(slug?: string): CampanaPublica {
  return slug && slug !== DEMO.slug ? { ...DEMO, slug } : DEMO;
}

export function recaudado(c: CampanaPublica) {
  return c.vendidos.length * c.precio;
}

export function estadoNumero(c: CampanaPublica, n: number) {
  if (c.vendidos.includes(n)) return "vendido" as const;
  if (c.reservados.includes(n)) return "reservado" as const;
  return "disponible" as const;
}

/** Orden de ejemplo para las pantallas del comprador. */
export type OrdenDemo = {
  token: string;
  codigo: string;
  numeros: number[];
  nombre: string;
  telefono: string;
  total: number;
  estado: "pendiente" | "revisando" | "aprobada";
  expiraEn: number; // minutos
};

export function ordenDemo(token: string, numeros: number[] = [42, 43]): OrdenDemo {
  const c = campanaDemo();
  return {
    token,
    codigo: "YT-" + token.slice(0, 4).toUpperCase(),
    numeros,
    nombre: "Luis Ramos",
    telefono: "987123456",
    total: numeros.length * c.precio,
    estado: "pendiente",
    expiraEn: 30,
  };
}
