import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export function DemoBanner() {
  const { isDemoAdmin } = useAuth();
  if (!isDemoAdmin) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/30
                    px-4 py-2 flex items-center gap-2 text-sm
                    text-amber-600 dark:text-amber-400">
      <ShieldAlert className="h-4 w-4 shrink-0" />
      <span>
        <strong>Modo demostración.</strong> Estás explorando la aplicación
        con datos ficticios. Las acciones de escritura (reservas, edición
        de perfil, gestión de pistas) no tienen ningún efecto real.
        Solo el administrador real puede ejecutarlas.
      </span>
    </div>
  );
}
