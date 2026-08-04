"use client";

import { useState } from "react";

/**
 * El código sellado del sorteo. Son 64 caracteres: mostrarlos completos
 * de entrada ocupa media pantalla y no le sirve a casi nadie. Se muestra
 * el principio y se expande a pedido, que es como se usa de verdad —solo
 * cuando alguien quiere comprobar.
 */
export function SelloVerificable({ hash }: { hash: string }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <p className="mt-3 text-[0.7rem] text-tinta-15">
      <span className="font-mono">{abierto ? hash : `${hash.slice(0, 16)}…`}</span>{" "}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="font-medium text-tinta-45 underline underline-offset-2 hover:text-tinta"
      >
        {abierto ? "ocultar" : "ver completo"}
      </button>
    </p>
  );
}
