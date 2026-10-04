import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeScale } from "@/lib/motion";
export function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Página no encontrada · Pádel Reservas";
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-10 text-foreground sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]" />
      </div>
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeScale}
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-12"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Error de navegación
        </p>
        <h1 className="mt-3 text-7xl font-extrabold leading-none text-foreground sm:text-8xl md:text-9xl">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Esta página no existe
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          La ruta que intentaste abrir no está disponible o fue movida. Vuelve
          al inicio para seguir gestionando tus reservas de pádel.
        </p>

        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        </div>
      </motion.section>
    </main>
  );
}