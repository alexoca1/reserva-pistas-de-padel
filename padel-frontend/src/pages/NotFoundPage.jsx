import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-xl shadow-slate-950/50 sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
          Error de navegación
        </p>
        <h1 className="mt-3 text-7xl font-extrabold leading-none text-white sm:text-8xl md:text-9xl">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-100 sm:text-3xl">
          Esta página no existe
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
          La ruta que intentaste abrir no está disponible o fue movida. Vuelve
          al inicio para seguir gestionando tus reservas de pádel.
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => navigate("/")}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            Volver al inicio
          </Button>
        </div>
      </section>
    </main>
  );
}
