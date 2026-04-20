import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.roles
      ? [user.roles]
      : [];
  const esAdmin = roles.includes("ROLE_ADMIN");

  const rolTexto = esAdmin ? "ROLE_ADMIN" : "ROLE_USER";
  const rolClases = esAdmin
    ? "border-red-500/40 bg-red-500/20 text-red-300"
    : "border-blue-500/40 bg-blue-500/20 text-blue-300";

  const nombreCompleto =
    `${user?.nombre || "Usuario"} ${user?.apellidos || ""}`.trim();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">¡Hola, {nombreCompleto}!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <p className="text-slate-300">
            Bienvenido al panel de gestión de reservas de pádel.
          </p>
          {/*<Badge className={rolClases}>{rolTexto}</Badge>*/}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-xl">Gestión de pistas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              Administra las pistas, iluminación y comentarios disponibles.
            </p>
            <Button
              onClick={() => navigate("/pistas")}
              className="w-full sm:w-auto"
            >
              Ir a Pistas
            </Button>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-xl">Gestión de reservas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              Consulta, crea y organiza reservas de los jugadores.
            </p>
            <Button
              onClick={() => navigate("/reservas")}
              className="w-full sm:w-auto"
            >
              Ir a Reservas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
