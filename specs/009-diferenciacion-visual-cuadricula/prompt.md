# Prompt de implementación — spec 009

Implementa specs/009-diferenciacion-visual-cuadricula siguiendo spec.md,
plan.md y tasks.md. Sigue .specify/memory/constitution.md — cambios mínimos,
sin dependencias nuevas.

## T01 - En padel-frontend/src/components/icons.tsx

Añade, junto a las demás funciones exportadas:

\`\`\`tsx
export function IconLock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
\`\`\`

## T02-T04 - Reemplaza el contenido completo de padel-frontend/src/components/CuadriculaDisponibilidad.tsx por:

\`\`\`tsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import type { DisponibilidadDia, FranjaOcupada } from "../types";
import { IconPlus, IconLock } from "@/components/icons";
import { fadeUp, staggerContainer } from "@/lib/motion";

const HORAS = Array.from({ length: 17 }, (_, i) =>
  `${String(i + 6).padStart(2, "0")}:00`
);

interface SlotInfo {
  tipo: "libre" | "propia" | "ocupada";
  franja?: FranjaOcupada;
}

interface Props {
  pistas: DisponibilidadDia[];
  usuarioId: number | null;
  isAdmin: boolean;
  pistaSeleccionada: number | null;
  onSlotLibreClick: (pistaId: number, horaInicio: string) => void;
  onReservaClick: (reservaId: number, pistaId: number) => void;
}

function calcularHoraFin(horaInicio: string): string {
  const [h] = horaInicio.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:00`;
}

function resolverSlot(
  hora: string,
  franjas: FranjaOcupada[],
  usuarioId: number | null
): SlotInfo {
  const horaFin = calcularHoraFin(hora);
  const franja = franjas.find(
    (f) => f.horaInicio < horaFin && f.horaFin > hora
  );
  if (!franja) return { tipo: "libre" };
  if (franja.usuarioId === usuarioId) return { tipo: "propia", franja };
  return { tipo: "ocupada", franja };
}

export function CuadriculaDisponibilidad({
  pistas,
  usuarioId,
  isAdmin,
  pistaSeleccionada,
  onSlotLibreClick,
  onReservaClick,
}: Props) {
  const pistasFiltradas = useMemo(
    () =>
      pistaSeleccionada !== null
        ? pistas.filter((p) => p.pistaId === pistaSeleccionada)
        : pistas,
    [pistas, pistaSeleccionada]
  );

  if (pistasFiltradas.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-muted-foreground backdrop-blur-xl">
        No hay pistas disponibles.
      </p>
    );
  }

  const numColumnas = pistasFiltradas.length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
    >
      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 px-4 pt-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-5 w-8 items-center justify-center rounded border border-dashed border-white/25">
            <IconPlus className="h-3 w-3 text-muted-foreground/70" />
          </span>
          Disponible — clic para reservar
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-5 w-8 rounded border border-primary/40 bg-primary/15 inline-block" />
          Tu reserva — clic para editar
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-5 w-8 items-center justify-center rounded bg-white/[0.08]">
            <IconLock className="h-3 w-3 text-muted-foreground/70" />
          </span>
          Ocupada
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid min-w-[480px]"
        style={{
          gridTemplateColumns: `56px repeat(${numColumnas}, minmax(0, 1fr))`,
        }}
      >
        <div className="px-2 py-3 text-xs text-muted-foreground" />
        {pistasFiltradas.map((pista) => (
          <div
            key={pista.pistaId}
            className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground border-l border-white/5"
          >
            Pista {pista.numeroPista}
          </div>
        ))}

        {HORAS.map((hora) => (
          <motion.div key={hora} className="contents" variants={fadeUp}>
            <div className="flex items-center px-2 py-2 text-xs text-muted-foreground border-t border-white/5">
              {hora}
            </div>

            {pistasFiltradas.map((pista) => {
              const slot = resolverSlot(hora, pista.franjas, usuarioId);

              if (slot.tipo === "libre") {
                return (
                  <button
                    key={pista.pistaId}
                    type="button"
                    onClick={() => onSlotLibreClick(pista.pistaId, hora)}
                    className="group border-t border-l border-white/5 p-1.5"
                    aria-label={`Reservar Pista ${pista.numeroPista} a las ${hora}`}
                  >
                    <span className="flex flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-white/20 py-1.5 transition group-hover:border-primary/50 group-hover:bg-primary/10">
                      <IconPlus className="h-3.5 w-3.5 text-muted-foreground/60 transition group-hover:text-primary" />
                      <span className="text-xs text-muted-foreground transition group-hover:text-primary">
                        Disponible
                      </span>
                    </span>
                  </button>
                );
              }

              if (slot.tipo === "propia") {
                return (
                  <button
                    key={pista.pistaId}
                    type="button"
                    onClick={() =>
                      slot.franja?.reservaId &&
                      onReservaClick(slot.franja.reservaId, pista.pistaId)
                    }
                    className="border-t border-l border-white/5 p-1.5"
                    aria-label={`Tu reserva en Pista ${pista.numeroPista} a las ${hora}`}
                  >
                    <span className="flex flex-col items-center justify-center gap-0.5 rounded-md border border-primary/40 bg-primary/15 py-1.5 transition hover:bg-primary/20">
                      <span className="text-xs font-medium text-primary">Tu reserva</span>
                      <span className="text-xs text-primary/70">
                        {slot.franja?.horaInicio}–{slot.franja?.horaFin}
                      </span>
                    </span>
                  </button>
                );
              }

              return (
                <div
                  key={pista.pistaId}
                  className="border-t border-l border-white/5 p-1.5"
                  aria-label={`Ocupada Pista ${pista.numeroPista} a las ${hora}`}
                >
                  <div className="flex flex-col items-center justify-center gap-0.5 rounded-md bg-white/[0.08] py-1.5">
                    {isAdmin && slot.franja?.nombreJugador ? (
                      <>
                        <span className="px-1 text-xs font-medium text-muted-foreground truncate">
                          {slot.franja.nombreJugador}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          {slot.franja.horaInicio}–{slot.franja.horaFin}
                        </span>
                      </>
                    ) : (
                      <>
                        <IconLock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span className="text-xs text-muted-foreground">Ocupada</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
\`\`\`

No toques ningún otro archivo, no añadas dependencias.

Verificación: en una fecha con mezcla de estados, confirmar visualmente que
"Disponible" (borde discontinuo + "+"), "Ocupada" (relleno sólido + candado)
y "Tu reserva" (verde) se distinguen sin necesidad de leer el texto.