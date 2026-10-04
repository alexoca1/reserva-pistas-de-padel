# Prompt de implementación — spec 008

Implementa specs/008-notificaciones-toast-confirmacion siguiendo spec.md,
plan.md y tasks.md (T01-T06). Sigue .specify/memory/constitution.md — sin
dependencias nuevas, reutiliza framer-motion ya instalado.

## T01 - Crear padel-frontend/src/context/ToastContext.tsx

\`\`\`tsx
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Toast {
  id: number;
  mensaje: string;
}

interface ToastContextValue {
  mostrarToast: (mensaje: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
const DURACION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrarToast = useCallback((mensaje: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, mensaje }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DURACION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="pointer-events-auto rounded-xl border border-primary/30 bg-primary/15 px-4 py-3 text-sm font-medium text-primary shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              {toast.mensaje}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook del mismo contexto
export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error("useToast debe ser usado dentro de ToastProvider");
  }
  return contexto;
}
\`\`\`

## T02 - En padel-frontend/src/main.tsx

Añade el import:
\`\`\`ts
import { ToastProvider } from "./context/ToastContext";
\`\`\`

Cambia:
\`\`\`tsx
<AuthProvider>
  <App />
</AuthProvider>
\`\`\`
por:
\`\`\`tsx
<AuthProvider>
  <ToastProvider>
    <App />
  </ToastProvider>
</AuthProvider>
\`\`\`

## T03-T04 - En padel-frontend/src/pages/PistasPage.tsx

Añade el import:
\`\`\`ts
import { useToast } from "../context/ToastContext";
\`\`\`

Dentro del componente, junto a `const { isAdmin, isAuthenticated } = useAuth();`:
\`\`\`ts
const { mostrarToast } = useToast();
\`\`\`

En `guardarPista`, cambia:
\`\`\`ts
if (pistaEditando?.id) {
  await pistasService.update(pistaEditando.id, payload);
} else {
  await pistasService.create(payload);
}

setOpenFormDialog(false);
setPistaEditando(null);
setForm(initialForm);
await cargarPistas();
\`\`\`
por:
\`\`\`ts
const eraEdicion = Boolean(pistaEditando?.id);
if (pistaEditando?.id) {
  await pistasService.update(pistaEditando.id, payload);
} else {
  await pistasService.create(payload);
}

setOpenFormDialog(false);
setPistaEditando(null);
setForm(initialForm);
await cargarPistas();
mostrarToast(eraEdicion ? "Pista actualizada" : "Pista creada");
\`\`\`

En `confirmarEliminar`, cambia:
\`\`\`ts
await pistasService.delete(pistaEliminando.id);
setOpenDeleteDialog(false);
setPistaEliminando(null);
await cargarPistas();
\`\`\`
por:
\`\`\`ts
await pistasService.delete(pistaEliminando.id);
setOpenDeleteDialog(false);
setPistaEliminando(null);
await cargarPistas();
mostrarToast("Pista eliminada");
\`\`\`

## T05-T06 - En padel-frontend/src/pages/ReservasPage.tsx

Añade el import:
\`\`\`ts
import { useToast } from "../context/ToastContext";
\`\`\`

Dentro del componente, junto a `const { user, isAdmin } = useAuth();`:
\`\`\`ts
const { mostrarToast } = useToast();
\`\`\`

En `guardarReserva`, dentro del bloque `try`, cambia:
\`\`\`ts
try {
  setLoading(true);
  if (reservaEditando?.id) {
    await reservasService.update(reservaEditando.id, payload);
  } else {
    await reservasService.create(payload);
  }
  setOpenFormDialog(false);
  setReservaEditando(null);
  setUsuarioSeleccionadoId(null);
  setForm(initialForm);
  await cargarDisponibilidad(fechaVista);
} catch (e) {
\`\`\`
por:
\`\`\`ts
try {
  setLoading(true);
  const eraEdicion = Boolean(reservaEditando?.id);
  if (reservaEditando?.id) {
    await reservasService.update(reservaEditando.id, payload);
  } else {
    await reservasService.create(payload);
  }
  setOpenFormDialog(false);
  setReservaEditando(null);
  setUsuarioSeleccionadoId(null);
  setForm(initialForm);
  await cargarDisponibilidad(fechaVista);
  mostrarToast(eraEdicion ? "Reserva actualizada" : "Reserva creada");
} catch (e) {
\`\`\`

En `confirmarEliminar`, cambia:
\`\`\`ts
await reservasService.delete(reservaEliminando.id);
setOpenDeleteDialog(false);
setReservaEliminando(null);
await cargarDisponibilidad(fechaVista);
\`\`\`
por:
\`\`\`ts
await reservasService.delete(reservaEliminando.id);
setOpenDeleteDialog(false);
setReservaEliminando(null);
await cargarDisponibilidad(fechaVista);
mostrarToast("Reserva eliminada");
\`\`\`

No toques el backend, no añadas dependencias, no toques ningún otro archivo.

Verificación: crea una pista → aparece "Pista creada" y desaparece sola a los
4s. Edítala → "Pista actualizada". Elimínala → "Pista eliminada". Repite con
una reserva. Dispara dos acciones seguidas (ej. crear dos reservas rápido) y
confirma que ambos toasts se ven apilados, no que uno sustituye al otro.