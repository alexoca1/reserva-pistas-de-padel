import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ToastItem {
  id: number;
  mensaje: string;
}

interface ToastContextValue {
  mostrarToast: (mensaje: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const mostrarToast = useCallback((mensaje: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, mensaje }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    const handleAppToast = (e: Event) => {
      const custom = e as CustomEvent<{ mensaje?: string }>;
      if (custom.detail?.mensaje) {
        mostrarToast(custom.detail.mensaje);
      }
    };
    window.addEventListener("app:toast", handleAppToast);
    return () => window.removeEventListener("app:toast", handleAppToast);
  }, [mostrarToast]);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
        aria-live="polite"
        role="status"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/10 bg-card/95 px-4 py-3 text-sm font-medium text-card-foreground shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>{toast.mensaje}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook del mismo contexto
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de un ToastProvider");
  }
  return context;
}
