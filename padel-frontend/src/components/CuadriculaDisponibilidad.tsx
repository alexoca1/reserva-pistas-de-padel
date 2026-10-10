import type { DisponibilidadDia } from "../types";
import { IconPlus, IconLock } from "./icons";
import { minutosAHora, sumarMinutos } from "@/lib/franjas";

interface CuadriculaDisponibilidadProps {
  pistas: DisponibilidadDia[];
  usuarioId: number | null;
  isAdmin: boolean;
  pistaSeleccionada: number | null;
  onSlotLibreClick: (pistaId: number, horaInicio: string) => void;
  onReservaClick: (reservaId: number, pistaId: number) => void;
}

const HORAS_RESERVA = Array.from({ length: 34 }, (_, i) => {
  const inicio = minutosAHora(360 + i * 30); // 06:00 a 22:30
  const fin = sumarMinutos(inicio, 30);
  return { inicio, fin };
});

export function CuadriculaDisponibilidad({
  pistas,
  usuarioId,
  isAdmin,
  pistaSeleccionada,
  onSlotLibreClick,
  onReservaClick,
}: CuadriculaDisponibilidadProps) {
  const pistasAMostrar =
    pistaSeleccionada !== null
      ? pistas.filter((p) => p.pistaId === pistaSeleccionada)
      : pistas;

  if (pistas.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
        No hay pistas registradas para mostrar disponibilidad.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3 text-xs">
        <span className="mr-1 font-semibold text-muted-foreground">Leyenda:</span>
        <div className="flex items-center gap-1.5 rounded-md border border-dashed border-white/20 bg-transparent px-2.5 py-1 text-muted-foreground/80">
          <IconPlus className="h-3 w-3" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 font-medium text-amber-300">
          <IconLock className="h-3 w-3" />
          <span>Ocupada</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/20 px-2.5 py-1 font-medium text-primary shadow-[0_0_12px_hsl(var(--primary)/0.15)]">
          <span>Tu reserva</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/15 px-2.5 py-1 font-medium text-destructive">
          <IconLock className="h-3 w-3" />
          <span>Mantenimiento</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="w-24 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hora
              </th>
              {pistasAMostrar.map((pista) => {
                const enMantenimiento = pista.estado === "MANTENIMIENTO";
                return (
                  <th
                    key={pista.pistaId}
                    className={`min-w-[140px] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                      enMantenimiento ? "text-destructive/90 bg-destructive/[0.04]" : "text-foreground"
                    }`}
                  >
                    <div>Pista {pista.numeroPista}</div>
                    {enMantenimiento ? (
                      <span className="inline-block mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-normal bg-destructive/20 text-destructive border border-destructive/30">
                        Mantenimiento
                      </span>
                    ) : pista.precioHora != null ? (
                      <span className="text-[10px] font-normal text-primary lowercase tracking-normal">
                        {Number(pista.precioHora).toFixed(2)} €/h
                      </span>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {HORAS_RESERVA.map(({ inicio }) => (
              <tr key={inicio} className="transition-colors hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-muted-foreground">
                  {inicio}
                </td>
                {pistasAMostrar.map((pista) => {
                  const enMantenimiento = pista.estado === "MANTENIMIENTO";
                  const franja = pista.franjas.find(
                    (f) => f.horaInicio <= inicio && f.horaFin > inicio
                  );

                  if (!franja) {
                    if (enMantenimiento) {
                      return (
                        <td key={pista.pistaId} className="p-1.5 text-center bg-destructive/[0.02]">
                          <div
                            className="flex h-10 w-full cursor-not-allowed items-center justify-center rounded-md border border-white/5 bg-white/[0.02] text-xs font-medium text-muted-foreground/40"
                            title="Pista en mantenimiento — No admite reservas"
                          >
                            <span>Mantenimiento</span>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={pista.pistaId} className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => onSlotLibreClick(pista.pistaId, inicio)}
                          className="group flex h-10 w-full items-center justify-center rounded-md border border-dashed border-white/20 bg-transparent text-xs font-medium text-muted-foreground/80 transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)] active:scale-[0.98]"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <IconPlus className="h-3 w-3 transition-transform group-hover:scale-110" />
                            <span>Disponible</span>
                          </div>
                        </button>
                      </td>
                    );
                  }

                  const esPropia =
                    usuarioId !== null && franja.usuarioId === usuarioId;

                  if (esPropia) {
                    return (
                      <td key={pista.pistaId} className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (franja.reservaId) {
                              onReservaClick(franja.reservaId, pista.pistaId);
                            }
                          }}
                          className="flex h-10 w-full items-center justify-center rounded-md border border-primary/40 bg-primary/20 px-2 text-xs font-medium text-primary shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-all duration-200 hover:border-primary hover:bg-primary/30 active:scale-[0.98]"
                          title="Haz clic para ver o editar esta reserva"
                        >
                          <span className="truncate">Tu reserva</span>
                        </button>
                      </td>
                    );
                  }

                  if (isAdmin) {
                    return (
                      <td key={pista.pistaId} className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (franja.reservaId) {
                              onReservaClick(franja.reservaId, pista.pistaId);
                            }
                          }}
                          className="flex h-10 w-full items-center justify-center rounded-md border border-amber-500/40 bg-amber-500/15 px-2 text-xs font-medium text-amber-300 transition-all duration-200 hover:border-amber-500/70 hover:bg-amber-500/25 active:scale-[0.98]"
                          title="Haz clic para ver o editar esta reserva"
                        >
                          <div className="flex items-center justify-center gap-1.5 truncate">
                            <IconLock className="h-3 w-3 shrink-0 opacity-80" />
                            <span className="truncate">
                              {franja.nombreJugador || "Ocupada"}
                            </span>
                          </div>
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={pista.pistaId} className="p-1.5 text-center">
                      <div
                        className="flex h-10 w-full cursor-not-allowed items-center justify-center rounded-md border border-amber-500/40 bg-amber-500/15 px-2 text-xs font-medium text-amber-300"
                        title="Horario ocupado"
                      >
                        <div className="flex items-center justify-center gap-1.5 truncate">
                          <IconLock className="h-3 w-3 shrink-0 opacity-80" />
                          <span className="truncate">Ocupada</span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
