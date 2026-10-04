# Prompt de implementación — spec 021

Implementa specs/021-gestion-reservas-dashboard siguiendo spec.md,
plan.md y tasks.md (T01-T11). Sigue .specify/memory/constitution.md —
cambios mínimos, sin dependencias nuevas.

Lee antes de empezar: `DashboardPage.tsx` completo (estado actual tras
specs 006 y 011), `ReservasPage.tsx` (handler de apertura de diálogo de
edición y cómo lee `location.state` hoy), `components/ui/dialog.tsx`,
`services/api.ts` (método `reservasService.delete`).

---

## T01 — Crear components/TarjetaReserva.tsx

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/TiltCard";
import type { Reserva } from "../types";
import { formatearFechaRelativa, parseFechaLocal } from "@/lib/fechas";

interface Props {
  reserva: Reserva;
  onEditar: (reserva: Reserva) => void;
  onEliminar: (reserva: Reserva) => void;
}

export function TarjetaReserva({ reserva, onEditar, onEliminar }: Props) {
  const fecha = parseFechaLocal(reserva.fechaReserva || reserva.fecha);
  const etiquetaFecha = fecha ? formatearFechaRelativa(fecha) : "—";
  const numeroPista =
    reserva.pista?.numeroPista ?? reserva.numeroPista ?? reserva.pistaId;

  return (
    <TiltCard>
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-card-foreground">
                Pista {numeroPista}
              </p>
              <p className="text-xs text-muted-foreground">
                {etiquetaFecha} · {reserva.horaInicio}–{reserva.horaFin}
              </p>
            </div>
            {reserva.codigoReserva && (
              <Badge variant="default" className="shrink-0 text-xs">
                {reserva.codigoReserva}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEditar(reserva)}
            >
              Editar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onEliminar(reserva)}
            >
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>
    </TiltCard>
  );
}
```

---

## T02-T07 — Reemplaza el contenido completo de DashboardPage.tsx

```tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TiltCard } from "@/components/TiltCard";
import { TarjetaReserva } from "@/components/TarjetaReserva";
import { reservasService, usuariosService } from "../services/api";
import type { Reserva, Usuario } from "../types";
import { getErrorMessage, getReservaUsuarioId } from "../types";
import { obtenerFechaHoyLocal, parseFechaLocal } from "@/lib/fechas";

const MAX_VISIBLE = 5;

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const nombreCompleto =
    `${user?.nombre || "Usuario"} ${user?.apellidos || ""}`.trim();

  // — Reservas próximas —
  const [proximasReservas, setProximasReservas] = useState<Reserva[]>([]);
  const [totalFuturas, setTotalFuturas] = useState(0);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [errorReservas, setErrorReservas] = useState("");

  // — Admin: lista de usuarios —
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState
    number | null
  >(null);

  // — Diálogo de confirmación de borrado —
  const [openDelete, setOpenDelete] = useState(false);
  const [reservaAEliminar, setReservaAEliminar] = useState<Reserva | null>(
    null
  );
  const [errorDelete, setErrorDelete] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Carga usuarios para el selector del admin
  useEffect(() => {
    if (!isAdmin || usuarios.length > 0) return;
    let activo = true;
    usuariosService
      .getAll()
      .then((data) => {
        if (activo && Array.isArray(data)) setUsuarios(data);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [isAdmin, usuarios.length]);

  // Carga reservas según rol y selección
  useEffect(() => {
    const idObjetivo = isAdmin ? usuarioSeleccionadoId : (user?.id ?? null);

    if (isAdmin && idObjetivo === null) {
      setProximasReservas([]);
      setTotalFuturas(0);
      setLoadingReservas(false);
      setErrorReservas("");
      return;
    }

    let activo = true;
    const cargar = async () => {
      try {
        setLoadingReservas(true);
        setErrorReservas("");
        const data = await reservasService.getAll();
        const reservas = Array.isArray(data) ? data : [];
        const hoy = obtenerFechaHoyLocal();
        const ahora = new Date();

        const propias = reservas.filter(
          (r) => getReservaUsuarioId(r) === idObjetivo
        );

        const futuras = propias.filter((r) => {
          const fecha = parseFechaLocal(r.fechaReserva || r.fecha);
          if (!fecha) return false;
          if (fecha.getTime() > hoy.getTime()) return true;
          if (fecha.getTime() === hoy.getTime()) {
            const [h, m] = r.horaFin.split(":").map(Number);
            const fin = new Date(fecha);
            fin.setHours(h, m, 0, 0);
            return fin.getTime() > ahora.getTime();
          }
          return false;
        });

        futuras.sort((a, b) => {
          const fa = parseFechaLocal(a.fechaReserva || a.fecha)!;
          const fb = parseFechaLocal(b.fechaReserva || b.fecha)!;
          if (fa.getTime() !== fb.getTime())
            return fa.getTime() - fb.getTime();
          return a.horaInicio.localeCompare(b.horaInicio);
        });

        if (activo) {
          setTotalFuturas(futuras.length);
          setProximasReservas(futuras.slice(0, MAX_VISIBLE));
        }
      } catch (e) {
        if (activo)
          setErrorReservas(
            getErrorMessage(e, "Error al cargar las reservas")
          );
      } finally {
        if (activo) setLoadingReservas(false);
      }
    };
    void cargar();
    return () => {
      activo = false;
    };
  }, [user?.id, isAdmin, usuarioSeleccionadoId]);

  const abrirEliminar = (reserva: Reserva) => {
    setReservaAEliminar(reserva);
    setErrorDelete("");
    setOpenDelete(true);
  };

  const confirmarEliminar = async () => {
    if (!reservaAEliminar) return;
    try {
      setLoadingDelete(true);
      setErrorDelete("");
      await reservasService.delete(reservaAEliminar.id);
      setOpenDelete(false);
      setReservaAEliminar(null);
      // Recarga local: quita la reserva eliminada del estado
      setProximasReservas((prev) =>
        prev.filter((r) => r.id !== reservaAEliminar.id)
      );
      setTotalFuturas((prev) => prev - 1);
      mostrarToast("Reserva eliminada");
    } catch (e) {
      setErrorDelete(getErrorMessage(e, "Error al eliminar la reserva"));
    } finally {
      setLoadingDelete(false);
    }
  };

  const editarReserva = (reserva: Reserva) => {
    navigate("/reservas", {
      state: {
        reservaId: reserva.id,
        pistaId: reserva.pista?.id ?? reserva.pistaId,
        fecha: reserva.fechaReserva || reserva.fecha,
      },
    });
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Saludo */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              ¡Hola, {nombreCompleto}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Bienvenido al panel de gestión de reservas de pádel.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navegación rápida — 2 columnas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <motion.div variants={fadeUp}>
          <TiltCard className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">Gestión de pistas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
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
          </TiltCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <TiltCard className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">
                  Gestión de reservas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
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
          </TiltCard>
        </motion.div>
      </div>

      {/* Sección de reservas próximas — ancho completo */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-xl">
              {isAdmin ? "Reservas del jugador" : "Tus próximas reservas"}
            </CardTitle>
            {totalFuturas > MAX_VISIBLE && (
              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => navigate("/reservas")}
              >
                Ver todas ({totalFuturas}) →
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selector de jugador (solo admin) */}
            {isAdmin && (
              <div className="space-y-1">
                <Label htmlFor="dashboardUsuarioSelect">Jugador</Label>
                <Select
                  id="dashboardUsuarioSelect"
                  value={
                    usuarioSeleccionadoId !== null
                      ? String(usuarioSeleccionadoId)
                      : ""
                  }
                  onChange={(e) =>
                    setUsuarioSeleccionadoId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">Selecciona un jugador</option>
                  {usuarios.map((u) => {
                    const nombre =
                      `${u.nombre || ""} ${u.apellidos || ""}`.trim();
                    return (
                      <option key={u.id} value={u.id}>
                        {nombre ? `${nombre} (${u.email})` : u.email}
                      </option>
                    );
                  })}
                </Select>
              </div>
            )}

            {/* Estados: sin selección admin / cargando / error / vacío / datos */}
            {isAdmin && usuarioSeleccionadoId === null ? (
              <p className="text-muted-foreground">
                Selecciona un jugador para ver sus reservas.
              </p>
            ) : loadingReservas ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : errorReservas ? (
              <p className="text-sm text-destructive">{errorReservas}</p>
            ) : proximasReservas.length === 0 ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  {isAdmin
                    ? "Este jugador no tiene reservas próximas."
                    : "No tienes reservas próximas."}
                </p>
                {!isAdmin && (
                  <Button
                    onClick={() => navigate("/reservas")}
                    className="w-full sm:w-auto"
                  >
                    Reservar ahora
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {proximasReservas.map((reserva) => (
                  <TarjetaReserva
                    key={reserva.id}
                    reserva={reserva}
                    onEditar={editarReserva}
                    onEliminar={abrirEliminar}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Diálogo de confirmación de borrado */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar reserva</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            ¿Seguro que quieres eliminar esta reserva? Esta acción no se
            puede deshacer.
          </p>
          {errorDelete && (
            <p className="text-sm text-destructive">{errorDelete}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              disabled={loadingDelete}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarEliminar}
              disabled={loadingDelete}
            >
              {loadingDelete ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
```

---

## T08-T09 — ReservasPage.tsx (descrito, no diff literal)

Lee el archivo actual antes de modificar.

**T08 — `fechaVista` lee `location.state?.fecha`:**

Localiza la inicialización de `fechaVista` (hoy un string ISO de la
fecha actual). Cámbiala para que use el estado de navegación si existe,
con el mismo patrón que ya usa `pistaSeleccionada` desde spec 004:

```ts
const [fechaVista, setFechaVista] = useState<string>(
  () =>
    (location.state as { fecha?: string } | null)?.fecha ??
    obtenerFechaISOHoyLocal()
);
```

Asegúrate de que `useLocation` ya está importado — si no, añádelo al
import de `react-router-dom`.

**T09 — Abrir diálogo de edición si viene `reservaId` en `location.state`:**

Añade un `useRef<boolean>` para asegurarte de que el efecto solo se
ejecuta una vez aunque el componente re-renderice:

```ts
const dialogoAbiertoPorNavegacion = useRef(false);
```

Añade un `useEffect` con dependencia en el array de disponibilidad
(`disponibilidad`) y en `location.state`:

```ts
useEffect(() => {
  if (dialogoAbiertoPorNavegacion.current) return;
  const state = location.state as
    | { reservaId?: number; pistaId?: number; fecha?: string }
    | null;
  if (!state?.reservaId || disponibilidad.length === 0) return;

  // Busca la reserva en las franjas ya cargadas
  for (const pista of disponibilidad) {
    const franja = pista.franjas?.find(
      (f) => f.reservaId === state.reservaId
    );
    if (franja) {
      // Reutiliza el mismo handler que abre el diálogo al hacer clic
      // en una celda "tu reserva" / "ocupada-admin" en la cuadrícula
      onReservaClick(franja.reservaId, pista.pistaId);
      dialogoAbiertoPorNavegacion.current = true;
      break;
    }
  }
}, [disponibilidad, location.state]);
```

`onReservaClick` es el handler interno de `ReservasPage` que ya abre
el diálogo de edición — no lo dupliques, llámalo directamente. Si en
el código actual ese handler tiene otro nombre, úsalo tal cual.

---

## T10 — padel-frontend/AGENTS.md (descrito)

En la lista de componentes, añade junto a `CuadriculaDisponibilidad.tsx`:

```diff
+- `TarjetaReserva.tsx`: tarjeta presentacional de una reserva con
+  botones de editar y eliminar. Usada en `DashboardPage`.
```

En la nota sobre `location.state` (sección de Rutas y Navegación),
añade:

```diff
 - Para pasar contexto ligero de una página a otra usar
   `navigate(ruta, { state: {...} })`. Hoy se usa para:
   - `pistaId` (spec 004): preseleccionar pista al llegar a Reservas
   - `reservaId` + `pistaId` + `fecha` (spec 021): abrir directamente
     el diálogo de edición de una reserva concreta al llegar a Reservas
     desde el Dashboard
```

---

## T11 — Verificación

1. Usuario con 3 reservas futuras: ve 3 tarjetas en el Dashboard; sin
   enlace "Ver todas".
2. Usuario con 7 reservas futuras: ve 5 tarjetas + enlace "Ver todas
   (7) →"; al pulsarlo llega a `/reservas`.
3. Eliminar una reserva con más de 24h de antelación (si spec 020 está
   implementada): toast "Reserva eliminada", la tarjeta desaparece.
4. Intentar eliminar con menos de 24h: el error de la spec 020 aparece
   inline en el diálogo, sin cerrar el diálogo.
5. "Editar" en una tarjeta: navega a `/reservas`, la cuadrícula ya está
   en la fecha de esa reserva, y el diálogo de edición se abre solo.
6. Admin: seleccionar un jugador muestra sus reservas; cambiar a otro
   jugador actualiza la lista; sin selección muestra el mensaje de espera.
7. Grid de navegación queda en 2 columnas en escritorio (Pistas y Reservas).

No añadas dependencias, no toques el backend, no toques ningún otro
archivo fuera de los listados en tasks.md.