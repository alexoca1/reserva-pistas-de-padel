import { useEffect, useState, useId } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { reservasService, usuariosService } from "../services/api";
import type { Reserva, Usuario } from "../types";
import { getErrorMessage, getReservaUsuarioId } from "../types";
import { obtenerFechaHoyLocal, parseFechaLocal } from "@/lib/fechas";
import { calcularTramoReembolso } from "@/lib/pagos";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TarjetaReserva } from "@/components/TarjetaReserva";
import { BuscadorJugador } from "@/components/BuscadorJugador";
import { GaleriaSedeAdmin } from "@/components/GaleriaSedeAdmin";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { selectedUserId?: number } | null;

  const nombreCompleto = `${user?.nombre || "Usuario"} ${user?.apellidos || ""}`.trim();
  const jugadorSelectId = useId();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<number | null>(
    () => locationState?.selectedUserId ?? null
  );

  useEffect(() => {
    if (locationState?.selectedUserId !== undefined) {
      setUsuarioSeleccionadoId(locationState.selectedUserId);
    }
  }, [locationState?.selectedUserId]);
  const [proximasReservas, setProximasReservas] = useState<Reserva[]>([]);
  const [totalFuturas, setTotalFuturas] = useState<number>(0);
  const [loadingReserva, setLoadingReserva] = useState(true);
  const [errorReserva, setErrorReserva] = useState("");

  // Diálogo de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reservaEliminando, setReservaEliminando] = useState<Reserva | null>(null);
  const [errorDelete, setErrorDelete] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [aPeticionDelJugador, setAPeticionDelJugador] = useState(false);

  // Carga de usuarios para admin
  useEffect(() => {
    if (isAdmin && usuarios.length === 0) {
      usuariosService
        .getAll()
        .then((data) => {
          setUsuarios(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          // Ignorar error no bloqueante
        });
    }
  }, [isAdmin, usuarios.length]);

  // Carga de próximas reservas
  const cargarProximasReservas = async () => {
    if (isAdmin && usuarioSeleccionadoId === null) {
      setLoadingReserva(false);
      setProximasReservas([]);
      setTotalFuturas(0);
      setErrorReserva("");
      return;
    }

    const targetUserId = isAdmin ? usuarioSeleccionadoId : user?.id;
    if (!targetUserId) {
      setLoadingReserva(false);
      setProximasReservas([]);
      setTotalFuturas(0);
      return;
    }

    try {
      setLoadingReserva(true);
      setErrorReserva("");
      const data = await reservasService.getAll();
      const reservas = Array.isArray(data) ? data : [];
      const hoy = obtenerFechaHoyLocal();
      const ahora = new Date();

      const propias = reservas.filter((r) => getReservaUsuarioId(r) === targetUserId);

      const futuras = propias.filter((r) => {
        if (r.estado === "CANCELADA") return false;
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

      setTotalFuturas(futuras.length);
      setProximasReservas(futuras.slice(0, 5));
    } catch (e) {
      setErrorReserva(getErrorMessage(e, "Error al cargar las reservas"));
    } finally {
      setLoadingReserva(false);
    }
  };

  useEffect(() => {
    let activo = true;
    const ejecutarCarga = async () => {
      if (isAdmin && usuarioSeleccionadoId === null) {
        if (activo) {
          setLoadingReserva(false);
          setProximasReservas([]);
          setTotalFuturas(0);
          setErrorReserva("");
        }
        return;
      }

      const targetUserId = isAdmin ? usuarioSeleccionadoId : user?.id;
      if (!targetUserId) {
        if (activo) {
          setLoadingReserva(false);
          setProximasReservas([]);
          setTotalFuturas(0);
        }
        return;
      }

      try {
        if (activo) {
          setLoadingReserva(true);
          setErrorReserva("");
        }
        const data = await reservasService.getAll();
        const reservas = Array.isArray(data) ? data : [];
        const hoy = obtenerFechaHoyLocal();
        const ahora = new Date();

        const propias = reservas.filter((r) => getReservaUsuarioId(r) === targetUserId);

        const futuras = propias.filter((r) => {
          if (r.estado === "CANCELADA") return false;
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

        if (activo) {
          setTotalFuturas(futuras.length);
          setProximasReservas(futuras.slice(0, 5));
        }
      } catch (e) {
        if (activo) setErrorReserva(getErrorMessage(e, "Error al cargar las reservas"));
      } finally {
        if (activo) setLoadingReserva(false);
      }
    };

    void ejecutarCarga();
    return () => {
      activo = false;
    };
  }, [user?.id, isAdmin, usuarioSeleccionadoId]);

  const handleEditar = (reserva: Reserva) => {
    const fechaStr = (reserva.fechaReserva || reserva.fecha)?.split("T")[0];
    const pistaId = reserva.pista?.id ?? reserva.pistaId;
    const targetUserId = usuarioSeleccionadoId ?? getReservaUsuarioId(reserva);
    navigate("/reservas", {
      state: {
        reservaId: reserva.id,
        pistaId,
        fecha: fechaStr,
        returnTo: "/dashboard",
        selectedUserId: targetUserId ?? undefined,
      },
    });
  };

  const handleSolicitarEliminar = (reserva: Reserva) => {
    setReservaEliminando(reserva);
    setErrorDelete("");
    setAPeticionDelJugador(false);
    setOpenDeleteDialog(true);
  };

  const confirmarEliminar = async () => {
    if (!reservaEliminando) return;
    try {
      setDeleting(true);
      setErrorDelete("");
      await reservasService.delete(reservaEliminando.id, { aPeticionDelJugador });
      mostrarToast("Reserva eliminada");
      setOpenDeleteDialog(false);
      setReservaEliminando(null);
      setAPeticionDelJugador(false);
      await cargarProximasReservas();
    } catch (e) {
      setErrorDelete(getErrorMessage(e, "Error al eliminar reserva"));
    } finally {
      setDeleting(false);
    }
  };

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

      {/* Grid de navegación */}
      <div className={`grid grid-cols-1 gap-6 ${isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Gestión de pistas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Administra las pistas, iluminación y comentarios disponibles.
              </p>
              <Button onClick={() => navigate("/pistas")} className="w-full sm:w-auto">
                Ir a Pistas
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Gestión de reservas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Consulta, crea y organiza reservas de los jugadores.
              </p>
              <Button onClick={() => navigate("/reservas")} className="w-full sm:w-auto">
                Ir a Reservas
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {isAdmin && (
          <motion.div variants={fadeUp}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">Validar QR</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Escanea o introduce el código de reserva para validar el acceso a pista.
                </p>
                <Button onClick={() => navigate("/admin/validar-qr")} className="w-full sm:w-auto">
                  Abrir validador
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Sección de ancho completo de Próximas Reservas */}
      <motion.div variants={fadeUp} className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-bold">
              {isAdmin ? "Próximas reservas del jugador" : "Tus próximas reservas"}
            </CardTitle>

            {isAdmin ? (
              <div className="flex items-center gap-2 sm:w-72">
                <Label htmlFor={jugadorSelectId} className="sr-only">
                  Jugador
                </Label>
                <BuscadorJugador
                  id={jugadorSelectId}
                  usuarios={usuarios}
                  value={usuarioSeleccionadoId}
                  onChange={setUsuarioSeleccionadoId}
                />
              </div>
            ) : null}
          </CardHeader>

          <CardContent>
            {isAdmin && usuarioSeleccionadoId === null ? (
              <p className="text-muted-foreground py-4 text-center">
                Selecciona un jugador para ver sus próximas reservas.
              </p>
            ) : loadingReserva ? (
              <p className="text-muted-foreground py-4 text-center">Cargando...</p>
            ) : errorReserva ? (
              <p className="text-sm text-destructive py-2">{errorReserva}</p>
            ) : proximasReservas.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {proximasReservas.map((reserva) => (
                    <TarjetaReserva
                      key={reserva.id}
                      reserva={reserva}
                      onEditar={handleEditar}
                      onEliminar={handleSolicitarEliminar}
                    />
                  ))}
                </div>

                {totalFuturas > 5 ? (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/reservas")}
                      className="group border border-primary/50 bg-primary/15 !text-white font-medium shadow-[0_0_15px_hsl(var(--primary)/0.2)] transition-all duration-200 hover:border-primary hover:!bg-primary hover:!text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                    >
                      <span>Ver todas ({totalFuturas})</span>
                      <span
                        aria-hidden="true"
                        className="text-primary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary-foreground"
                      >
                        →
                      </span>
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4 py-4 text-center">
                <p className="text-muted-foreground">
                  {isAdmin
                    ? "Este jugador no tiene reservas próximas."
                    : "No tienes reservas próximas."}
                </p>
                <Button onClick={() => navigate("/reservas")}>
                  {isAdmin ? "Reservar pista" : "Reservar ahora"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Sección exclusiva de Administrador: Galería de la sede */}
      {isAdmin && <GaleriaSedeAdmin />}

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar reserva</DialogTitle>
          </DialogHeader>

          {errorDelete ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorDelete}
            </p>
          ) : null}

          <div className="space-y-4">
            <p className="text-sm text-foreground">
              ¿Seguro que quieres cancelar esta reserva?
            </p>

            {reservaEliminando && (
              <div className="rounded-md border border-border/50 bg-muted/20 p-3 text-sm">
                <p className="font-medium mb-1">Información de reembolso:</p>
                {(() => {
                  const tramo = calcularTramoReembolso(reservaEliminando, 24);
                  if (tramo.costeTotal === 0) return <span className="text-muted-foreground">La reserva no tenía coste.</span>;
                  return (
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Coste original: <strong>{tramo.costeTotal.toFixed(2)} €</strong></li>
                      <li>Porcentaje a reembolsar: <strong>{tramo.porcentaje}%</strong> (antelación: {Math.floor(tramo.minutosHastaInicio / 60)}h)</li>
                      <li>Importe a reembolsar: <strong>{tramo.importeReembolso.toFixed(2)} €</strong></li>
                    </ul>
                  );
                })()}
              </div>
            )}

            {isAdmin && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="aPeticionDelJugadorDashboard"
                  className="rounded border-gray-300"
                  checked={aPeticionDelJugador}
                  onChange={(e) => setAPeticionDelJugador(e.target.checked)}
                />
                <label htmlFor="aPeticionDelJugadorDashboard" className="text-sm text-foreground font-medium">
                  Cancelar a petición del jugador (aplicar penalización de tramos)
                </label>
              </div>
            )}
            
            {isAdmin && !aPeticionDelJugador && reservaEliminando && (
              <p className="text-xs text-muted-foreground">
                * Como admin, si no marcas la casilla, se reembolsará el 100% independientemente de la antelación.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpenDeleteDialog(false);
                setErrorDelete("");
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmarEliminar()}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}