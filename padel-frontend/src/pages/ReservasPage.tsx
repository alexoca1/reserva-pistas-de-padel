import { useEffect, useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { reservasService, pistasService, usuariosService, configuracionService } from "../services/api";
import type { DisponibilidadDia, Pista, Reserva, ReservaPayload, Usuario, ConfiguracionDuraciones } from "../types";
import { getErrorMessage } from "../types";
import { obtenerFechaHoyLocal, obtenerFechaISOHoyLocal, parseFechaLocal } from "@/lib/fechas";
import { sumarMinutos, horaAMinutos, minutosAHora } from "@/lib/franjas";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BuscadorJugador } from "@/components/BuscadorJugador";
import { IconPlus } from "@/components/icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { CuadriculaDisponibilidad } from "@/components/CuadriculaDisponibilidad";

// ─── Formulario ────────────────────────────────────────────────────────────────

interface ReservaForm {
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  nombreJugador: string;
  telefono: string;
  pistaId: string;
}

const initialForm: ReservaForm = {
  fechaReserva: "",
  horaInicio: "",
  horaFin: "",
  nombreJugador: "",
  telefono: "",
  pistaId: "",
};

// ─── Constantes ────────────────────────────────────────────────────────────────

const HORA_APERTURA = "06:00";
const HORA_CIERRE = "23:00";
const HORAS_RESERVA = Array.from({ length: 33 }, (_, i) => minutosAHora(6 * 60 + i * 30));

// ─── Componente ────────────────────────────────────────────────────────────────

export function ReservasPage() {
  const { user, isAdmin } = useAuth();
  const { mostrarToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // datos
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDia[]>([]);
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // configuración de duraciones
  const [configDuraciones, setConfigDuraciones] = useState<ConfiguracionDuraciones>({
    duracionesPermitidas: [60, 90, 120],
    duracionPorDefecto: 90,
  });

  // vista
  const [fechaVista, setFechaVista] = useState<string>(
    () => (location.state as { fecha?: string } | null)?.fecha ?? obtenerFechaISOHoyLocal()
  );
  const [pistaSeleccionada, setPistaSeleccionada] = useState<number | null>(
    () => (location.state as { pistaId?: number } | null)?.pistaId ?? null
  );

  // diálogo
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reservaEditando, setReservaEditando] = useState<Reserva | null>(null);
  const [reservaEliminando, setReservaEliminando] = useState<Reserva | null>(null);
  const [form, setForm] = useState<ReservaForm>(initialForm);
  const [duracionMinutos, setDuracionMinutos] = useState<number>(90);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<number | null>(null);

  // auto-apertura diálogo de edición desde navegación (Dashboard)
  const autoOpenRef = useRef(false);
  const navState = location.state as {
    reservaId?: number;
    pistaId?: number;
    fecha?: string;
    returnTo?: string;
    selectedUserId?: number;
  } | null;
  const reservaIdNav = navState?.reservaId;
  const pistaIdNav = navState?.pistaId;
  const returnTo = navState?.returnTo;
  const selectedUserIdNav = navState?.selectedUserId;

  const cerrarOVolver = () => {
    setOpenFormDialog(false);
    setOpenDeleteDialog(false);
    setReservaEditando(null);
    setReservaEliminando(null);
    setUsuarioSeleccionadoId(null);
    setForm(initialForm);
    setError("");
    if (returnTo) {
      navigate(returnTo, {
        state: selectedUserIdNav ? { selectedUserId: selectedUserIdNav } : undefined,
      });
    }
  };

  // ─── Carga de datos ──────────────────────────────────────────────────────────

  const cargarDisponibilidad = async (fecha: string) => {
    try {
      setLoading(true);
      setError("");
      const [dispData, pistasData] = await Promise.all([
        reservasService.getDisponibilidadDia(fecha),
        pistasService.getAll(),
      ]);
      setDisponibilidad(Array.isArray(dispData) ? dispData : []);
      setPistas(
        Array.isArray(pistasData)
          ? [...pistasData].sort((a, b) => (a.numeroPista ?? 0) - (b.numeroPista ?? 0))
          : []
      );

      if (isAdmin && usuarios.length === 0) {
        const usuariosData = await usuariosService.getAll();
        if (Array.isArray(usuariosData)) setUsuarios(usuariosData);
      }
    } catch (e) {
      setError(getErrorMessage(e, "Error al cargar disponibilidad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarDisponibilidad(fechaVista);
  }, [fechaVista, isAdmin]);

  useEffect(() => {
    configuracionService.getDuraciones()
      .then((data) => {
        if (data && Array.isArray(data.duracionesPermitidas)) {
          setConfigDuraciones(data);
        }
      })
      .catch(() => { /* usa fallback por defecto */ });
  }, []);

  // ─── Validación ──────────────────────────────────────────────────────────────

  const validarReserva = (f: ReservaForm): string | null => {
    if (!f.fechaReserva) return "Debes seleccionar una fecha.";
    if (!f.horaInicio || !f.horaFin) return "Debes seleccionar hora de inicio.";
    if (f.horaInicio < HORA_APERTURA) return "La hora de inicio no puede ser antes de las 06:00.";
    if (f.horaFin > HORA_CIERRE) return "La reserva no puede terminar después de las 23:00.";
    if (f.horaInicio >= f.horaFin) return "La hora de fin debe ser posterior a la de inicio.";

    const pistaSeleccionadaObj = pistas.find((p) => String(p.id) === f.pistaId);
    if (pistaSeleccionadaObj?.estado === "MANTENIMIENTO") {
      return "La pista seleccionada está en mantenimiento y no admite reservas.";
    }

    const hoy = obtenerFechaHoyLocal();
    const fechaSeleccionada = parseFechaLocal(f.fechaReserva);
    if (!fechaSeleccionada) return "La fecha no es válida.";
    fechaSeleccionada.setHours(0, 0, 0, 0);
    if (fechaSeleccionada < hoy) return "No se pueden crear reservas en fechas pasadas.";

    if (fechaSeleccionada.getTime() === hoy.getTime()) {
      const limiteMinimo = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const limiteEsOtroDia = limiteMinimo.getDate() !== hoy.getDate();
      if (limiteEsOtroDia) return "Para hoy ya no hay horarios disponibles.";
      const horaMinimaHoy = `${String(limiteMinimo.getHours()).padStart(2, "0")}:${String(limiteMinimo.getMinutes()).padStart(2, "0")}`;
      if (f.horaInicio < horaMinimaHoy) {
        return `La hora de inicio debe ser al menos 2 horas desde ahora. Mínimo: ${horaMinimaHoy}.`;
      }
    }

    // ─── Validación del límite diario y solapamiento del usuario ───
    const titularId = isAdmin ? usuarioSeleccionadoId : user?.id;
    if (titularId && f.fechaReserva === fechaVista && disponibilidad.length > 0) {
      const reservasUsuarioMap = new Map<number, { horaInicio: string; horaFin: string }>();

      for (const d of disponibilidad) {
        for (const franja of d.franjas) {
          if (
            franja.usuarioId === titularId &&
            franja.reservaId &&
            franja.horaInicio &&
            franja.horaFin
          ) {
            if (!reservaEditando || franja.reservaId !== reservaEditando.id) {
              reservasUsuarioMap.set(franja.reservaId, {
                horaInicio: franja.horaInicio,
                horaFin: franja.horaFin,
              });
            }
          }
        }
      }

      const duracionNueva = horaAMinutos(f.horaFin) - horaAMinutos(f.horaInicio);
      let minutosExistentes = 0;

      for (const r of reservasUsuarioMap.values()) {
        // 1. Solapamiento en la misma franja horaria para el usuario
        if (r.horaInicio < f.horaFin && r.horaFin > f.horaInicio) {
          return `El usuario ya tiene una reserva en otra pista en esa misma franja horaria (${r.horaInicio} - ${r.horaFin}).`;
        }
        minutosExistentes += horaAMinutos(r.horaFin) - horaAMinutos(r.horaInicio);
      }

      // 2. Límite máximo de 2 horas (120 minutos) por día
      if (minutosExistentes + duracionNueva > 120) {
        return `Límite diario superado: solo se permite un máximo de 2 horas (120 minutos) de reserva por día. ${
          minutosExistentes > 0
            ? `(Ya tiene ${minutosExistentes / 60}h reservadas hoy)`
            : ""
        }`.trim();
      }
    }

    return null;
  };

  // ─── Apertura de diálogos ────────────────────────────────────────────────────

  const abrirNuevaReserva = async (pistaId?: number, horaInicio?: string) => {
    setReservaEditando(null);
    setError("");
    const defDur = configDuraciones.duracionPorDefecto || 90;
    setDuracionMinutos(defDur);

    const nombreAutenticado = `${user?.nombre || ""} ${user?.apellidos || ""}`.trim();
    const initHoraInicio = horaInicio ?? "";
    const initHoraFin = initHoraInicio ? sumarMinutos(initHoraInicio, defDur) : "";

    if (isAdmin) {
      setUsuarioSeleccionadoId(null);
      if (usuarios.length === 0) {
        try {
          const data = await usuariosService.getAll();
          if (Array.isArray(data)) setUsuarios(data);
        } catch { /* continúa sin usuarios */ }
      }
      setForm({
        ...initialForm,
        fechaReserva: fechaVista,
        pistaId: pistaId ? String(pistaId) : "",
        horaInicio: initHoraInicio,
        horaFin: initHoraFin,
      });
    } else {
      setForm({
        ...initialForm,
        fechaReserva: fechaVista,
        pistaId: pistaId ? String(pistaId) : "",
        horaInicio: initHoraInicio,
        horaFin: initHoraFin,
        nombreJugador: nombreAutenticado,
        telefono: user?.telefono || "",
      });
    }
    setOpenFormDialog(true);
  };

  const abrirEditarReserva = (reservaId: number, pistaId: number) => {
    // Busca la reserva en la disponibilidad cargada
    const dispPista = disponibilidad.find((d) => d.pistaId === pistaId);
    const franja = dispPista?.franjas.find((f) => f.reservaId === reservaId);
    if (!franja) return;

    setError("");
    setReservaEditando({ id: reservaId } as Reserva);

    const defDur = configDuraciones.duracionPorDefecto || 90;
    const duracion = (franja.horaInicio && franja.horaFin)
      ? horaAMinutos(franja.horaFin) - horaAMinutos(franja.horaInicio)
      : defDur;
    setDuracionMinutos(configDuraciones.duracionesPermitidas.includes(duracion) ? duracion : defDur);

    if (isAdmin) {
      setUsuarioSeleccionadoId(franja.usuarioId);
      const userObj = usuarios.find((u) => u.id === franja.usuarioId);
      setForm({
        fechaReserva: fechaVista,
        horaInicio: franja.horaInicio,
        horaFin: franja.horaFin,
        nombreJugador: franja.nombreJugador ?? "",
        telefono: userObj?.telefono ?? "",
        pistaId: String(pistaId),
      });
    } else {
      setForm({
        fechaReserva: fechaVista,
        horaInicio: franja.horaInicio,
        horaFin: franja.horaFin,
        nombreJugador: franja.nombreJugador ?? "",
        telefono: user?.telefono || "",
        pistaId: String(pistaId),
      });
    }
    setOpenFormDialog(true);
  };

  useEffect(() => {
    if (!loading && reservaIdNav && !autoOpenRef.current && disponibilidad.length > 0) {
      autoOpenRef.current = true;
      let targetPistaId = pistaIdNav;
      if (!targetPistaId) {
        for (const d of disponibilidad) {
          if (d.franjas.some((f) => f.reservaId === reservaIdNav)) {
            targetPistaId = d.pistaId;
            break;
          }
        }
      }
      if (targetPistaId) {
        abrirEditarReserva(reservaIdNav, targetPistaId);
      }
    }
  }, [loading, reservaIdNav, pistaIdNav, disponibilidad]);

  const abrirEliminarDesdeForm = () => {
    if (!reservaEditando) return;
    setOpenFormDialog(false);
    setOpenDeleteDialog(true);
    setReservaEliminando(reservaEditando);
  };

  // ─── Guardar / Eliminar ──────────────────────────────────────────────────────

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const guardarReserva = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const horaFinCalculada = form.horaInicio ? sumarMinutos(form.horaInicio, duracionMinutos) : "";
    const formConHoraFin = { ...form, horaFin: horaFinCalculada };

    const errorValidacion = validarReserva(formConHoraFin);
    if (errorValidacion) { setError(errorValidacion); return; }
    if (!user?.id) { setError("No se pudo identificar el usuario."); return; }
    if (!form.pistaId) { setError("Debes seleccionar una pista."); return; }

    let titularId: number;
    let nombreJugadorPayload: string;

    if (isAdmin) {
      if (!usuarioSeleccionadoId) { setError("Debes seleccionar un jugador."); return; }
      const usuarioElegido = usuarios.find((u) => u.id === usuarioSeleccionadoId);
      titularId = usuarioSeleccionadoId;
      nombreJugadorPayload = usuarioElegido
        ? `${usuarioElegido.nombre} ${usuarioElegido.apellidos}`.trim()
        : form.nombreJugador;
    } else {
      titularId = user.id;
      nombreJugadorPayload = `${user?.nombre || ""} ${user?.apellidos || ""}`.trim();
    }

    const payload: ReservaPayload = {
      fechaReserva: formConHoraFin.fechaReserva,
      fecha: formConHoraFin.fechaReserva,
      horaInicio: formConHoraFin.horaInicio,
      horaFin: formConHoraFin.horaFin,
      nombreJugador: nombreJugadorPayload,
      telefono: formConHoraFin.telefono,
      pistaId: Number(formConHoraFin.pistaId),
      pista: { id: Number(formConHoraFin.pistaId) },
      usuarioId: titularId,
      usuario: { id: titularId },
    };

    try {
      setLoading(true);
      if (reservaEditando?.id) {
        await reservasService.update(reservaEditando.id, payload);
        mostrarToast("Reserva actualizada");
      } else {
        await reservasService.create(payload);
        mostrarToast("Reserva creada");
      }
      setOpenFormDialog(false);
      setReservaEditando(null);
      setUsuarioSeleccionadoId(null);
      setForm(initialForm);
      if (returnTo) {
        navigate(returnTo, {
          state: selectedUserIdNav ? { selectedUserId: selectedUserIdNav } : undefined,
        });
        return;
      }
      await cargarDisponibilidad(fechaVista);
    } catch (e) {
      setError(getErrorMessage(e, "Error al guardar reserva"));
      await cargarDisponibilidad(fechaVista);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!reservaEliminando?.id) return;
    try {
      setLoading(true);
      await reservasService.delete(reservaEliminando.id);
      mostrarToast("Reserva eliminada");
      setOpenDeleteDialog(false);
      setReservaEliminando(null);
      if (returnTo) {
        navigate(returnTo, {
          state: selectedUserIdNav ? { selectedUserId: selectedUserIdNav } : undefined,
        });
        return;
      }
      await cargarDisponibilidad(fechaVista);
    } catch (e) {
      setError(getErrorMessage(e, "Error al eliminar reserva"));
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Cabecera */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
        <Button onClick={() => abrirNuevaReserva()}>
          <IconPlus className="h-4 w-4" />
          Nueva reserva
        </Button>
      </motion.div>

      {/* Selector de fecha + pista (móvil) */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="fechaVista">Fecha</Label>
          <Input
            id="fechaVista"
            type="date"
            value={fechaVista}
            onChange={(e) => setFechaVista(e.target.value)}
            className="w-44"
          />
        </div>

        {/* T10: selector de pista visible solo en móvil */}
        {disponibilidad.length > 0 ? (
          <div className="flex flex-col gap-1 md:hidden">
            <Label htmlFor="pistaMovil">Pista</Label>
            <Select
              id="pistaMovil"
              value={pistaSeleccionada !== null ? String(pistaSeleccionada) : ""}
              onChange={(e) =>
                setPistaSeleccionada(e.target.value ? Number(e.target.value) : null)
              }
              className="w-44"
            >
              <option value="">Todas</option>
              {disponibilidad.map((d) => (
                <option key={d.pistaId} value={d.pistaId}>
                  Pista {d.numeroPista}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </motion.div>

      {/* Error global */}
      {error && !openFormDialog ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {/* Estado de carga */}
      {loading ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-muted-foreground backdrop-blur-xl">
          Cargando disponibilidad...
        </p>
      ) : null}

      {/* Cuadrícula — T08 */}
      {!loading ? (
        <motion.div variants={fadeUp}>
          <CuadriculaDisponibilidad
            pistas={disponibilidad}
            usuarioId={user?.id ?? null}
            isAdmin={isAdmin}
            pistaSeleccionada={pistaSeleccionada}
            onSlotLibreClick={(pistaId, horaInicio) =>
              abrirNuevaReserva(pistaId, horaInicio)
            }
            onReservaClick={(reservaId, pistaId) =>
              abrirEditarReserva(reservaId, pistaId)
            }
          />
        </motion.div>
      ) : null}

      {/* ── Diálogo de formulario ── */}
      <Dialog
        open={openFormDialog}
        onOpenChange={(open) => {
          if (!open && !openDeleteDialog) {
            cerrarOVolver();
          } else {
            setOpenFormDialog(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reservaEditando ? "Editar reserva" : "Nueva reserva"}
            </DialogTitle>
          </DialogHeader>

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <form className="space-y-4" onSubmit={guardarReserva}>
            <div className="grid gap-2">
              <Label htmlFor="fechaReserva">Fecha</Label>
              <Input
                id="fechaReserva"
                name="fechaReserva"
                type="date"
                value={form.fechaReserva}
                onChange={handleChange}
                min={obtenerFechaISOHoyLocal()}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="horaInicio">Hora inicio</Label>
                <Select
                  id="horaInicio"
                  name="horaInicio"
                  value={form.horaInicio}
                  onChange={(e) => {
                    const hInicio = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      horaInicio: hInicio,
                      horaFin: hInicio ? sumarMinutos(hInicio, duracionMinutos) : "",
                    }));
                  }}
                  required
                >
                  <option value="">Selecciona una hora</option>
                  {HORAS_RESERVA.map((hora) => (
                    <option key={hora} value={hora}>{hora}</option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duracionMinutos">Duración</Label>
                <Select
                  id="duracionMinutos"
                  name="duracionMinutos"
                  value={String(duracionMinutos)}
                  onChange={(e) => {
                    const dur = Number(e.target.value);
                    setDuracionMinutos(dur);
                    if (form.horaInicio) {
                      setForm((prev) => ({
                        ...prev,
                        horaFin: sumarMinutos(prev.horaInicio, dur),
                      }));
                    }
                  }}
                  required
                >
                  <option value="60">60 minutos (1h)</option>
                  <option value="90">90 minutos (1h 30m)</option>
                  <option value="120">120 minutos (2h)</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombreJugador">Jugador</Label>
              {isAdmin ? (
                <BuscadorJugador
                  id="nombreJugador"
                  usuarios={usuarios.filter((u) => u.id !== user?.id)}
                  value={usuarioSeleccionadoId}
                  onChange={(id) => {
                    setUsuarioSeleccionadoId(id);
                    const u = usuarios.find((userItem) => userItem.id === id);
                    setForm((prev) => ({
                      ...prev,
                      nombreJugador: u
                        ? `${u.nombre || ""} ${u.apellidos || ""}`.trim()
                        : "",
                      telefono: u?.telefono ?? (id === null ? "" : prev.telefono),
                    }));
                  }}
                />
              ) : (
                <Input
                  id="nombreJugador"
                  name="nombreJugador"
                  type="text"
                  value={form.nombreJugador}
                  readOnly
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                type="text"
                value={form.telefono}
                readOnly
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pistaId">Pista</Label>
              <Select
                id="pistaId"
                name="pistaId"
                value={form.pistaId}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una pista</option>
                {pistas.map((pista) => {
                  const enMantenimiento = pista.estado === "MANTENIMIENTO";
                  const precioTxt = pista.precioHora != null ? ` (${Number(pista.precioHora).toFixed(2)} €/h)` : "";
                  return (
                    <option
                      key={pista.id}
                      value={pista.id}
                      disabled={enMantenimiento && String(pista.id) !== form.pistaId}
                    >
                      Pista {pista.numeroPista} {enMantenimiento ? "(En mantenimiento)" : precioTxt}
                    </option>
                  );
                })}
              </Select>
            </div>

            {/* Coste estimado en tiempo real */}
            <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Coste estimado:</span>
              <span className="font-semibold text-foreground">
                {(() => {
                  const pistaSel = pistas.find((p) => String(p.id) === form.pistaId);
                  if (!pistaSel) return "—";
                  if (pistaSel.precioHora == null) return "Consultar en recepción";
                  const coste = (Number(pistaSel.precioHora) * duracionMinutos) / 60;
                  return `${coste.toFixed(2)} € (${Number(pistaSel.precioHora).toFixed(2)} €/h · ${duracionMinutos} min)`;
                })()}
              </span>
            </div>

            <DialogFooter>
              {reservaEditando ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={abrirEliminarDesdeForm}
                  className="mr-auto"
                >
                  Eliminar
                </Button>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={cerrarOVolver}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {reservaEditando ? "Guardar cambios" : "Crear reserva"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Diálogo de confirmación de borrado ── */}
      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          if (!open && !openFormDialog) {
            cerrarOVolver();
          } else {
            setOpenDeleteDialog(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar reserva</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-foreground">
            ¿Seguro que quieres eliminar esta reserva?
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={cerrarOVolver}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmarEliminar()}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}