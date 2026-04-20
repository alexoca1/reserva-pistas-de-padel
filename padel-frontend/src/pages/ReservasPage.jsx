import { useEffect, useState } from "react";
import { reservasService, pistasService } from "../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  fechaReserva: "",
  horaInicio: "",
  horaFin: "",
  nombreJugador: "",
  telefono: "",
  pistaId: "",
};

const HORA_APERTURA = "06:00";
const HORA_CIERRE = "23:00";

const obtenerFechaHoyLocal = () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
};

const obtenerFechaISOHoyLocal = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const parseFechaLocal = (fechaTexto) => {
  if (!fechaTexto) return null;
  const soloFecha = fechaTexto.includes("T")
    ? fechaTexto.split("T")[0]
    : fechaTexto;
  const [anio, mes, dia] = soloFecha.split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia);
};

export function ReservasPage() {
  const { user, isAdmin } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);
  const [reservaEliminando, setReservaEliminando] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    cargarDatos();
  }, []);

  const getReservaUsuarioId = (reserva) => {
    return reserva?.usuario?.id ?? reserva?.usuarioId ?? null;
  };

  const esReservaPropia = (reserva) => {
    if (!user?.id) return false;
    return getReservaUsuarioId(reserva) === user.id;
  };

  const puedeGestionarReserva = (reserva) => {
    return isAdmin || esReservaPropia(reserva);
  };

  const puedeVerDatosSensibles = (reserva) => {
    return isAdmin || esReservaPropia(reserva);
  };

  const validarReserva = () => {
    if (!form.fechaReserva) {
      return "Debes seleccionar una fecha para la reserva.";
    }

    if (!form.horaInicio || !form.horaFin) {
      return "Debes seleccionar hora de inicio y hora de fin.";
    }

    if (form.horaInicio < HORA_APERTURA) {
      return "La hora de inicio no puede ser inferior a las 06:00 AM.";
    }

    if (form.horaFin > HORA_CIERRE) {
      return "La hora de fin no puede ser superior a las 11:00 PM.";
    }

    if (form.horaInicio >= form.horaFin) {
      return "La hora de fin debe ser posterior a la hora de inicio.";
    }

    const hoy = obtenerFechaHoyLocal();
    const fechaSeleccionada = parseFechaLocal(form.fechaReserva);
    if (!fechaSeleccionada) {
      return "La fecha seleccionada no es válida.";
    }
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      return "No se pueden crear reservas con fechas anteriores al día de hoy.";
    }

    if (fechaSeleccionada.getTime() === hoy.getTime()) {
      const ahora = new Date();
      const limiteMinimo = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);
      const limiteEsOtroDia =
        limiteMinimo.getFullYear() !== ahora.getFullYear() ||
        limiteMinimo.getMonth() !== ahora.getMonth() ||
        limiteMinimo.getDate() !== ahora.getDate();

      if (limiteEsOtroDia) {
        return "Para hoy ya no hay horarios disponibles. Debes reservar para otro día.";
      }

      const horaMinimaHoy = `${String(limiteMinimo.getHours()).padStart(2, "0")}:${String(
        limiteMinimo.getMinutes(),
      ).padStart(2, "0")}`;

      if (form.horaInicio < horaMinimaHoy) {
        return `Si reservas para hoy, la hora de inicio debe ser al menos 2 horas mayor a la hora actual. Hora mínima permitida: ${horaMinimaHoy}.`;
      }
    }

    return null;
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const [reservasData, pistasData] = await Promise.all([
        reservasService.getAll(),
        pistasService.getAll(),
      ]);
      const hoy = obtenerFechaHoyLocal();
      const reservasFiltradas = (
        Array.isArray(reservasData) ? reservasData : []
      ).filter((reserva) => {
        const fecha = parseFechaLocal(reserva.fechaReserva || reserva.fecha);
        if (!fecha) return false;
        fecha.setHours(0, 0, 0, 0);
        return fecha >= hoy;
      });

      setReservas(reservasFiltradas);
      setPistas(Array.isArray(pistasData) ? pistasData : []);
    } catch (e) {
      setError(e.message || "Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  };

  const abrirNuevaReserva = () => {
    setReservaEditando(null);
    setError("");
    const nombreAutenticado =
      `${user?.nombre || ""} ${user?.apellidos || ""}`.trim();
    setForm({
      ...initialForm,
      nombreJugador: nombreAutenticado,
    });
    setOpenFormDialog(true);
  };

  // En ReservasPage.jsx, mejora abrirEditarReserva para soportar ambos formatos de fecha
  const abrirEditarReserva = (reserva) => {
    if (!puedeGestionarReserva(reserva)) {
      setError("No tienes permisos para editar esta reserva.");
      return;
    }
    setError("");
    setReservaEditando(reserva);
    setForm({
      fechaReserva: (reserva.fechaReserva || reserva.fecha || "").slice(0, 10),
      horaInicio: reserva.horaInicio || "",
      horaFin: reserva.horaFin || "",
      nombreJugador: reserva.nombreJugador || "",
      telefono: reserva.telefono || "",
      pistaId: String(reserva.pista?.id || reserva.pistaId || ""),
    });
    setOpenFormDialog(true);
  };

  const abrirEliminarReserva = (reserva) => {
    if (!puedeGestionarReserva(reserva)) {
      setError("No tienes permisos para eliminar esta reserva.");
      return;
    }
    setReservaEliminando(reserva);
    setOpenDeleteDialog(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // En ReservasPage.jsx, reemplaza guardarReserva completo
  const guardarReserva = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const errorValidacion = validarReserva();
      if (errorValidacion) {
        setError(errorValidacion);
        setLoading(false);
        return;
      }

      const nombreAutenticado =
        `${user?.nombre || ""} ${user?.apellidos || ""}`.trim();
      if (!user?.id) {
        throw new Error("No se pudo identificar el usuario autenticado.");
      }
      if (!form.pistaId) {
        throw new Error("Debes seleccionar una pista.");
      }

      // Payload compatible con ambos contratos de backend
      const payload = {
        fechaReserva: form.fechaReserva,
        fecha: form.fechaReserva,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        nombreJugador: nombreAutenticado,
        telefono: form.telefono,
        pistaId: Number(form.pistaId),
        pista: { id: Number(form.pistaId) },
        usuarioId: user.id,
        usuario: { id: user.id },
      };

      if (reservaEditando?.id) {
        if (!puedeGestionarReserva(reservaEditando)) {
          throw new Error("No tienes permisos para editar esta reserva.");
        }
        await reservasService.update(reservaEditando.id, payload);
      } else {
        await reservasService.create(payload);
      }

      setOpenFormDialog(false);
      setReservaEditando(null);
      setForm(initialForm);
      await cargarDatos();
    } catch (e) {
      setError(e.message || "Error al guardar reserva");
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!reservaEliminando?.id) return;
    try {
      setLoading(true);
      setError("");
      if (!puedeGestionarReserva(reservaEliminando)) {
        throw new Error("No tienes permisos para eliminar esta reserva.");
      }
      await reservasService.delete(reservaEliminando.id);
      setOpenDeleteDialog(false);
      setReservaEliminando(null);
      await cargarDatos();
    } catch (e) {
      setError(e.message || "Error al eliminar reserva");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Reservas</h1>
        <Button onClick={abrirNuevaReserva}>Nueva reserva</Button>
      </div>

      {error ? (
        <p className="rounded-md border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border border-slate-800 bg-slate-900/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora inicio</TableHead>
              <TableHead>Hora fin</TableHead>
              <TableHead>Jugador</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Pista</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && reservas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400">
                  Cargando reservas...
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && reservas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400">
                  No hay reservas registradas.
                </TableCell>
              </TableRow>
            ) : null}

            {reservas.map((reserva) => (
              <TableRow key={reserva.id}>
                <TableCell>
                  {(reserva.fechaReserva || reserva.fecha || "").slice(0, 10)}
                </TableCell>
                <TableCell>{reserva.horaInicio}</TableCell>
                <TableCell>{reserva.horaFin}</TableCell>
                <TableCell>
                  {puedeVerDatosSensibles(reserva)
                    ? reserva.nombreJugador || "-"
                    : ""}
                </TableCell>
                <TableCell>
                  {puedeVerDatosSensibles(reserva)
                    ? reserva.telefono || "-"
                    : ""}
                </TableCell>
                <TableCell>
                  <Badge>
                    Pista{" "}
                    {reserva.pista?.numeroPista ||
                      reserva.numeroPista ||
                      reserva.pistaId ||
                      "-"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {puedeGestionarReserva(reserva) ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        className="bg-slate-700 text-slate-100 hover:bg-slate-600"
                        onClick={() => abrirEditarReserva(reserva)}
                      >
                        Editar
                      </Button>
                      <Button
                        className="bg-red-600 text-white hover:bg-red-500"
                        onClick={() => abrirEliminarReserva(reserva)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Sin permisos</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openFormDialog} onOpenChange={setOpenFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reservaEditando ? "Editar reserva" : "Nueva reserva"}
            </DialogTitle>
          </DialogHeader>

          {error ? (
            <p className="rounded-md border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
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
              <p className="text-xs text-slate-400">
                Solo se permiten reservas desde hoy en adelante.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="horaInicio">Hora inicio</Label>
                <Input
                  id="horaInicio"
                  name="horaInicio"
                  type="time"
                  value={form.horaInicio}
                  onChange={handleChange}
                  min={HORA_APERTURA}
                  max="22:59"
                  required
                />
                <p className="text-xs text-slate-400">Desde las 06:00 AM.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="horaFin">Hora fin</Label>
                <Input
                  id="horaFin"
                  name="horaFin"
                  type="time"
                  value={form.horaFin}
                  onChange={handleChange}
                  min="06:01"
                  max={HORA_CIERRE}
                  required
                />
                <p className="text-xs text-slate-400">Hasta las 11:00 PM.</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombreJugador">Jugador</Label>
              <Input
                id="nombreJugador"
                name="nombreJugador"
                type="text"
                placeholder="Nombre del jugador"
                value={form.nombreJugador}
                readOnly
                required
              />
              {/*<p className="text-xs text-slate-400">
                Este campo se completa automáticamente con el nombre del usuario
                autenticado.
              </p>*/}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                type="text"
                placeholder="600123123"
                value={form.telefono}
                onChange={handleChange}
                required
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
                {pistas.map((pista) => (
                  <option key={pista.id} value={pista.id}>
                    Pista {pista.numeroPista}
                  </option>
                ))}
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                className="bg-slate-700 text-slate-100 hover:bg-slate-600"
                onClick={() => {
                  setOpenFormDialog(false);
                  setError("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {reservaEditando ? "Guardar cambios" : "Crear reserva"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar reserva</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-300">
            ¿Seguro que quieres eliminar la reserva de{" "}
            <strong>
              {reservaEliminando?.nombreJugador || "este jugador"}
            </strong>
            ?
          </p>
          <DialogFooter>
            <Button
              type="button"
              className="bg-slate-700 text-slate-100 hover:bg-slate-600"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={confirmarEliminar}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
