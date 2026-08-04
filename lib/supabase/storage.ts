"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Sube una imagen desde el navegador y devuelve su URL pública.
 *
 * Va por el cliente y no por el Server Action porque el archivo ya está
 * acá: mandarlo primero al servidor solo agrega un salto. Las políticas
 * de Storage exigen que la carpeta sea el id del usuario, así que un
 * organizador nunca puede escribir en la carpeta de otro.
 */
export async function subirImagen(
  archivo: File,
  bucket: "campaign-covers" | "prize-images",
): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const extension = archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ruta = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(ruta, archivo, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) return null;

  const { data } = supabase.storage.from(bucket).getPublicUrl(ruta);
  return data.publicUrl;
}
