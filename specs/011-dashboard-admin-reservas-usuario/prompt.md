# Prompt de implementación — spec 011

Implementa specs/011-dashboard-admin-reservas-usuario siguiendo spec.md,
plan.md y tasks.md. Sigue .specify/memory/constitution.md — cambios
mínimos, sin dependencias nuevas, sin tocar backend.

Reemplaza el contenido completo de padel-frontend/src/pages/DashboardPage.tsx por:

\`\`\`tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TiltCard } from "@/components/TiltCard";
import { reservasService, usuariosService } from "../services/api";
import type { Reserva, Usuario } from "../types";
import { getErrorMessage, getReservaUsuarioId } from "../types";
import { obtenerFechaHoyLocal, parseFechaLocal, formatearFechaRelativa } from "@/lib/fechas";

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const nombreCompleto = `${user?.nombre || "Usuario"} ${user?.apellidos || ""}`.trim();

  const [proximaReserva, setProximaReserva] = useState<Reserva | null>(null);
  const [loadingReserva, setLoadingReserva] = useState(true);
  const [errorReserva, setErrorReserva] = useState("");

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin || usuarios.length > 0) return;
    let activo = true;
    usuariosService
      .getAll()
      .then((data) => {
        if (activo && Array.isArray(data)) setUsuarios(data);
      })
      .catch(() => { /* silencioso: el selector queda vacío */ });
    return () => { activo = false; };
  }, [isAdmin, usuarios.length]);

  useEffect(() => {
    const idObjetivo = isAdmin ? usuarioSeleccionadoId : (user?.id ?? null);

    if (isAdmin && idObjetivo === null) {
      setProximaReserva(null);
      setLoadingReserva(false);
      setErrorReserva("");
      return;
    }

    let activo = true;
    const cargarProximaReserva = async () => {
      try {
        setLoadingReserva(true);
        setErrorReserva("");
        const data = await reservasService.getAll();
        const reservas = Array.isArray(data) ? data : [];
        const hoy = obtenerFechaHoyLocal();
        const ahora = new Date();

        const delObjetivo = reservas.filter((r) => getReservaUsuarioId(r) === idObjetivo);

        const futuras = delObjetivo.filter((r) => {
          const fecha = parseFechaLocal(r.fechaReserva || r.fecha);
          if (!fecha) return false;
          if (fecha.getTime() > hoy.getTime()) return true;
          if (fecha.getTime() === hoy.getTime()) {
            const [h, m] = r.horaFin.split(":").map(Number);
            const finReserva = new Date(fecha);
            finReserva.setHours(h, m, 0, 0);
            return finReserva.getTime() > ahora.getTime();
          }
          return false;
        });

        futuras.sort((a, b) => {
          const fechaA = parseFechaLocal(a.fechaReserva || a.fecha)!;
          const fechaB = parseFechaLocal(b.fechaReserva || b.fecha)!;
          if (fechaA.getTime() !== fechaB.getTime()) return fechaA.getTime() - fechaB.getTime();
          return a.horaInicio.localeCompare(b.horaInicio);
        });

        if (activo) setProximaReserva(futuras[0] ?? null);
      } catch (e) {
        if (activo) setErrorReserva(getErrorMessage(e, "Error al cargar la próxima reserva"));
      } finally {
        if (activo) setLoadingReserva(false);
      }
    };
    void cargarProximaReserva();
    return () => { activo = false; };
  }, [user?.id, isAdmin, usuarioSeleccionadoId]);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">¡Hola, {nombreCompleto}!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <p className="text-muted-foreground">Bienvenido al panel de gestión de reservas de pádel.</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div variants={fadeUp}>
          <TiltCard className="h-full">
            <Card className="h-full">
              <CardHeader><CardTitle className="text-xl">Gestión de pistas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Administra las pistas, iluminación y comentarios disponibles.</p>
                <Button onClick={() => navigate("/pistas")} className="w-full sm:w-auto">Ir a Pistas</Button>
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <TiltCard className="h-full">
            <Card className="h-full">
              <CardHeader><CardTitle className="text-xl">Gestión de reservas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Consulta, crea y organiza reservas de los jugadores.</p>
                <Button onClick={() => navigate("/reservas")} className="w-full sm:w-auto">Ir a Reservas</Button>
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <TiltCard className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">
                  {isAdmin ? "Próxima reserva de un jugador" : "Tu próxima reserva"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAdmin ? (
                  <div className="space-y-1">
                    <Label htmlFor="dashboardUsuarioSelect">Jugador</Label>
                    <Select
                      id="dashboardUsuarioSelect"
                      value={usuarioSeleccionadoId !== null ? String(usuarioSeleccionadoId) : ""}
                      onChange={(e) =>
                        setUsuarioSeleccionadoId(e.target.value ? Number(e.target.value) : null)
                      }
                    >
                      <option value="">Selecciona un jugador</option>
                      {usuarios.map((u) => {
                        const nombre = `${u.nombre || ""} ${u.apellidos || ""}`.trim();
                        return (
                          <option key={u.id} value={u.id}>
                            {nombre ? `${nombre} (${u.email})` : u.email}
                          </option>
                        );
                      })}
                    </Select>
                  </div>
                ) : null}

                {isAdmin && usuarioSeleccionadoId === null ? (
                  <p className="text-muted-foreground">
                    Selecciona un jugador para ver su próxima reserva.
                  </p>
                ) : loadingReserva ? (
                  <p className="text-muted-foreground">Cargando...</p>
                ) : errorReserva ? (
                  <p className="text-sm text-destructive">{errorReserva}</p>
                ) : proximaReserva ? (
                  <>
                    <p className="text-muted-foreground">
                      Pista {proximaReserva.pista?.numeroPista ?? proximaReserva.numeroPista ?? proximaReserva.pistaId}
                      {" — "}
                      {formatearFechaRelativa(parseFechaLocal(proximaReserva.fechaReserva || proximaReserva.fecha)!)}{" "}
                      {proximaReserva.horaInicio}–{proximaReserva.horaFin}
                    </p>
                    <Button
                      onClick={() => navigate("/reservas", {
                        state: { pistaId: proximaReserva.pista?.id ?? proximaReserva.pistaId },
                      })}
                      className="w-full sm:w-auto"
                    >
                      {isAdmin ? "Ver reservas" : "Ver mis reservas"}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">
                      {isAdmin ? "Este jugador no tiene reservas próximas." : "No tienes reservas próximas."}
                    </p>
                    <Button onClick={() => navigate("/reservas")} className="w-full sm:w-auto">
                      Reservar ahora
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
\`\`\`

No toques el backend, no añadas dependencias, no toques ningún otro archivo.

Verificación: como usuario normal, confirmar que la tarjeta se comporta
igual que antes de este cambio (sin selector, "Tu próxima reserva"). Como
admin, confirmar que aparece el selector, que antes de elegir se ve el
mensaje de espera sin hacer ninguna petición, y que al cambiar entre dos
jugadores distintos la reserva mostrada cambia correctamente para cada uno.