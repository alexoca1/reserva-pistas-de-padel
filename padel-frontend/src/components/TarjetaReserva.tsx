import type { Reserva } from "../types";
import { parseFechaLocal, formatearFechaRelativa } from "@/lib/fechas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useAuth } from "../context/AuthContext";

interface TarjetaReservaProps {
  reserva: Reserva;
  onEditar: (reserva: Reserva) => void;
  onEliminar: (reserva: Reserva) => void;
}

export function TarjetaReserva({ reserva, onEditar, onEliminar }: TarjetaReservaProps) {
  const { isDemoAdmin } = useAuth();
  const fechaObj = parseFechaLocal(reserva.fechaReserva || reserva.fecha);
  const fechaTexto = fechaObj ? formatearFechaRelativa(fechaObj) : "";
  const numeroPista = reserva.pista?.numeroPista ?? reserva.numeroPista ?? reserva.pistaId;

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            Pista {numeroPista}
          </CardTitle>
          {fechaTexto ? (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {fechaTexto}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {reserva.horaInicio} – {reserva.horaFin}
          </span>
          {reserva.costeEstimado != null ? (
            <span className="font-semibold text-foreground">
              {Number(reserva.costeEstimado).toFixed(2)} €
            </span>
          ) : null}
        </div>
        
        {reserva.pagos && reserva.pagos.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-border/50 pt-2 text-xs">
            {reserva.pagos.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between">
                <span className={pago.tipo === "COBRO" ? "text-muted-foreground" : "text-green-600 dark:text-green-400 font-medium"}>
                  {pago.tipo === "COBRO" ? "Cobro" : "Reembolso"} ({pago.metodo === "TARJETA_SIMULADA" ? "Tarjeta" : "Bizum"})
                </span>
                <span className={pago.tipo === "COBRO" ? "font-medium" : "font-medium text-green-600 dark:text-green-400"}>
                  {pago.tipo === "COBRO" ? "-" : "+"}{Number(pago.importe).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={() => onEditar(reserva)}
            className="flex-1 py-1.5 text-xs"
          >
            Editar
          </Button>
          {isDemoAdmin ? (
            <span className="flex-1 text-center text-xs italic text-muted-foreground">
              No disponible en demo
            </span>
          ) : (
            <Button
              variant="destructive"
              onClick={() => onEliminar(reserva)}
              className="flex-1 py-1.5 text-xs"
            >
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
