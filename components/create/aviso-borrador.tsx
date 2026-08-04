"use client";

/**
 * Aviso de campaña a medio terminar.
 *
 * Va dentro del asistente, bajo la barra de avance: sin overlay y sin
 * paso propio. El borrador ya está cargado cuando esto aparece, así que
 * "Continuar" solo cierra el aviso — no hay nada que restaurar.
 *
 * Solo se muestra al volver en otra sesión del navegador: recargar en
 * medio del flujo no lo dispara, porque ahí no ayuda a nadie.
 */
export function AvisoBorrador({
  causa,
  onContinuar,
  onEmpezarDeNuevo,
}: {
  causa: string;
  onContinuar: () => void;
  onEmpezarDeNuevo: () => void;
}) {
  return (
    <div className="rounded-talon border-2 border-tara bg-tara-suave p-4">
      <p className="text-sm font-medium">Tienes una campaña a medio terminar</p>
      <p className="mt-1 font-display text-lg font-bold leading-tight">
        {causa || "Sin nombre todavía"}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onContinuar}
          className="rounded-talon-sm bg-anil px-4 py-2 text-sm font-semibold text-white hover:bg-anil-oscuro"
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={onEmpezarDeNuevo}
          className="rounded-talon-sm px-4 py-2 text-sm font-medium text-tinta-70 hover:text-tinta"
        >
          Empezar de nuevo
        </button>
      </div>
    </div>
  );
}
