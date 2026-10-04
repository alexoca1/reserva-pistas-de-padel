# Prompt de implementación — spec 006

Implementa specs/006-proxima-reserva-dashboard siguiendo spec.md, plan.md y
tasks.md (T01-T08). Sigue .specify/memory/constitution.md — cambios mínimos,
sin dependencias nuevas, reutiliza lo que ya existe.

## T01 - Crear padel-frontend/src/lib/fechas.ts

```ts
export const obtenerFechaHoyLocal = () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
};

export const obtenerFechaISOHoyLocal = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
};

export const parseFechaLocal = (fechaTexto?: string | null) => {
  if (!fechaTexto) return null;
  const soloFecha = fechaTexto.includes("T") ? fechaTexto.split("T")[0] : fechaTexto;
  const [anio, mes, dia] = soloFecha.split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia);
};

export const formatearFechaRelativa = (fecha: Date): string => {
  const hoy = obtenerFechaHoyLocal();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  if (fecha.getTime() === hoy.getTime()) return "Hoy";
  if (fecha.getTime() === manana.getTime()) return "Mañana";
  return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}`;
};
```

## T02 - En ReservasPage.tsx

Elimina las definiciones locales de `obtenerFechaHoyLocal`, `obtenerFechaISOHoyLocal`
y `parseFechaLocal` (son idénticas a las de arriba). Añade el import:

```ts
import { obtenerFechaHoyLocal, obtenerFechaISOHoyLocal, parseFechaLocal } from "@/lib/fechas";
```

## T03 - En types/index.ts

Añade, junto a `getErrorMessage`:

```ts
export function getReservaUsuarioId(reserva: Reserva): number | null {
  return reserva?.usuario?.id ?? reserva?.usuarioId ?? null;
}
```

## T04 - En ReservasPage.tsx

Elimina la definición local de `getReservaUsuarioId` (es idéntica a la de
arriba). Añade `getReservaUsuarioId` al import ya existente de `"../types"`.

## T05-T08 - En DashboardPage.tsx

Añade a los imports existentes:

```ts
import { useEffect, useState } from "react";
import { reservasService } from "../services/api";
import type { Reserva } from "../types";
import { getErrorMessage, getReservaUsuarioId } from "../types";
import { obtenerFechaHoyLocal, parseFechaLocal, formatearFechaRelativa } from "@/lib/fechas";
```

Dentro del componente, junto a `const { user } = useAuth();`, añade:

```ts
const [proximaReserva, setProximaReserva] = useState<Reserva | null>(null);
const [loadingReserva, setLoadingReserva] = useState(true);
const [errorReserva, setErrorReserva] = useState("");

useEffect(() => {
  let activo = true;
  const cargarProximaReserva = async () => {
    try {
      setLoadingReserva(true);
      setErrorReserva("");
      const data = await reservasService.getAll();
      const reservas = Array.isArray(data) ? data : [];
      const hoy = obtenerFechaHoyLocal();
      const ahora = new Date();

      const propias = reservas.filter((r) => getReservaUsuarioId(r) === user?.id);

      const futuras = propias.filter((r) => {
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
      if (activo) setErrorReserva(getErrorMessage(e, "Error al cargar tu próxima reserva"));
    } finally {
      if (activo) setLoadingReserva(false);
    }
  };
  void cargarProximaReserva();
  return () => { activo = false; };
}, [user?.id]);
```

Cambia `<div className="grid grid-cols-1 gap-6 md:grid-cols-2">` por
`<div className="grid grid-cols-1 gap-6 md:grid-cols-3">`, y añade una tercera
`motion.div` con el mismo patrón `TiltCard > Card > CardHeader/CardContent`
que las dos existentes:

```tsx
<motion.div variants={fadeUp}>
  <TiltCard className="h-full">
    <Card className="h-full">
      <CardHeader><CardTitle className="text-xl">Tu próxima reserva</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {loadingReserva ? (
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
              Ver mis reservas
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">No tienes reservas próximas.</p>
            <Button onClick={() => navigate("/reservas")} className="w-full sm:w-auto">
              Reservar ahora
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  </TiltCard>
</motion.div>
```

No toques el backend, no añadas dependencias.

Verificación: usuario con reserva futura ve pista/fecha/hora correctos; usuario
sin reservas ve el estado vacío con botón "Reservar ahora"; admin ve únicamente
su propia próxima reserva aunque existan reservas de otros usuarios ese mismo
día; una reserva de hoy ya finalizada no debe aparecer como próxima.