"use client";

import { BORRADOR_VACIO, type BorradorCampana } from "@/lib/domain/campana";

/**
 * El borrador vive solo en el navegador hasta que se publica.
 *
 * Nada se escribe en la base sin sesión: quien abandona a mitad no deja
 * basura, y quien inicia sesión con otra cuenta no genera ningún conflicto
 * de propiedad, porque el borrador no tiene dueño hasta el final.
 *
 * El texto va en localStorage y las imágenes en IndexedDB: los File no se
 * pueden serializar a JSON, pero IndexedDB guarda Blobs tal cual, sin
 * inflarlos a base64.
 */

const CLAVE = "yunta.borrador.v1";
const BD = "yunta";
const ALMACEN = "imagenes";
const VENCE_EN_DIAS = 7;

type Guardado = {
  datos: Omit<BorradorCampana, "portadaArchivo" | "premios"> & {
    premios: { nombre: string }[];
  };
  paso: number;
  guardadoEn: number;
  /** Se marca antes de salir a autenticarse, para publicar al volver. */
  pendientePublicar?: boolean;
};

// ── IndexedDB, lo mínimo ────────────────────────────────────
function abrirBD(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    const req = indexedDB.open(BD, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(ALMACEN);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function guardarImagen(clave: string, archivo: File | null) {
  const bd = await abrirBD();
  if (!bd) return;
  const tx = bd.transaction(ALMACEN, "readwrite");
  if (archivo) tx.objectStore(ALMACEN).put(archivo, clave);
  else tx.objectStore(ALMACEN).delete(clave);
}

function leerImagen(bd: IDBDatabase, clave: string): Promise<File | null> {
  return new Promise((resolve) => {
    const req = bd.transaction(ALMACEN, "readonly").objectStore(ALMACEN).get(clave);
    req.onsuccess = () => resolve((req.result as File) ?? null);
    req.onerror = () => resolve(null);
  });
}

async function borrarImagenes() {
  const bd = await abrirBD();
  if (!bd) return;
  bd.transaction(ALMACEN, "readwrite").objectStore(ALMACEN).clear();
}

// ── API ─────────────────────────────────────────────────────

export async function guardarBorrador(
  b: BorradorCampana,
  paso: number,
  pendientePublicar = false,
) {
  try {
    const guardado: Guardado = {
      datos: {
        causa: b.causa,
        historia: b.historia,
        meta: b.meta,
        metaOmitida: b.metaOmitida,
        portadaFoto: null, // las URLs locales mueren al recargar
        portadaPaleta: b.portadaPaleta,
        precio: b.precio,
        cantidad: b.cantidad,
        premios: b.premios.map((p) => ({ nombre: p.nombre })),
        fechaSorteo: b.fechaSorteo,
        yape: b.yape,
        titular: b.titular,
        terminos: b.terminos,
      },
      paso,
      guardadoEn: Date.now(),
      pendientePublicar,
    };

    localStorage.setItem(CLAVE, JSON.stringify(guardado));

    await guardarImagen("portada", b.portadaArchivo);
    await Promise.all(
      b.premios.map((p, i) => guardarImagen(`premio-${i}`, p.fotoArchivo)),
    );
  } catch {
    // Sin espacio o en modo privado: se sigue trabajando en memoria.
  }
}

export async function leerBorrador(): Promise<{
  borrador: BorradorCampana;
  paso: number;
  pendientePublicar: boolean;
} | null> {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;

    const g = JSON.parse(crudo) as Guardado;

    // Un borrador viejo es más probablemente basura olvidada que trabajo.
    if (Date.now() - g.guardadoEn > VENCE_EN_DIAS * 86400000) {
      await borrarBorrador();
      return null;
    }

    const bd = await abrirBD();
    const portadaArchivo = bd ? await leerImagen(bd, "portada") : null;

    const premios = await Promise.all(
      g.datos.premios.map(async (p, i) => {
        const archivo = bd ? await leerImagen(bd, `premio-${i}`) : null;
        return {
          nombre: p.nombre,
          fotoArchivo: archivo,
          fotoPreview: archivo ? URL.createObjectURL(archivo) : null,
        };
      }),
    );

    return {
      borrador: {
        ...BORRADOR_VACIO,
        ...g.datos,
        premios: premios.length ? premios : BORRADOR_VACIO.premios,
        portadaArchivo,
        portadaFoto: portadaArchivo ? URL.createObjectURL(portadaArchivo) : null,
      },
      paso: g.paso,
      pendientePublicar: Boolean(g.pendientePublicar),
    };
  } catch {
    return null;
  }
}

/** Se llama antes de salir a autenticarse. */
export async function marcarPendientePublicar(b: BorradorCampana, paso: number) {
  await guardarBorrador(b, paso, true);
}

/**
 * Se limpia la marca ANTES de publicar, no después: si el usuario recarga
 * mientras se publica, no queremos crear la campaña dos veces.
 */
export async function limpiarMarcaPublicar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return;
    const g = JSON.parse(crudo) as Guardado;
    g.pendientePublicar = false;
    localStorage.setItem(CLAVE, JSON.stringify(g));
  } catch {
    /* si falla, el peor caso es que no se auto-publique */
  }
}

export async function borrarBorrador() {
  try {
    localStorage.removeItem(CLAVE);
    await borrarImagenes();
  } catch {
    /* nada que hacer */
  }
}

export function hayBorrador() {
  try {
    return Boolean(localStorage.getItem(CLAVE));
  } catch {
    return false;
  }
}
