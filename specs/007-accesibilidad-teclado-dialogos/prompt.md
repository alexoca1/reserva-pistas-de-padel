# Prompt de implementación — spec 007

Implementa specs/007-accesibilidad-teclado-dialogos siguiendo spec.md, plan.md
y tasks.md (T01-T04). Sigue .specify/memory/constitution.md — cambios
mínimos, sin dependencias nuevas, todo el cambio va en un único archivo.

Reemplaza el contenido completo de padel-frontend/src/components/ui/dialog.tsx por:

\`\`\`tsx
import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

interface DialogSectionProps {
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, children, className = "max-w-lg" }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const elementoPrevioRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      elementoPrevioRef.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onOpenChange(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }

    elementoPrevioRef.current?.focus();
    elementoPrevioRef.current = null;
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            tabIndex={-1}
            className={`relative z-10 w-full ${className} rounded-2xl border border-white/10 bg-white/[0.07] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl focus:outline-none`}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function DialogContent({ children, className = "" }: DialogSectionProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function DialogHeader({ children, className = "" }: DialogSectionProps) {
  return <div className={`mb-5 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }: DialogSectionProps) {
  return <h2 id="dialog-title" className={`text-xl font-semibold text-card-foreground ${className}`}>{children}</h2>;
}

export function DialogFooter({ children, className = "" }: DialogSectionProps) {
  return <div className={`mt-6 flex flex-wrap justify-end gap-3 ${className}`}>{children}</div>;
}
\`\`\`

No toques ningún otro archivo, no añadas dependencias.

Verificación: en Pistas y Reservas, abre cada diálogo navegando solo con
teclado (Tab hasta el botón, Enter para activar). Confirma que el foco entra
al panel del diálogo. Pulsa Escape y confirma que se cierra y que el foco
vuelve exactamente al botón que lo abrió, no a otro lugar de la página.