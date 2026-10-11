import type { Reserva } from "../types";

export function calcularTramoReembolso(
  reserva: Reserva,
  horasCancelacionGratuita: number = 24
): {
  porcentaje: number;
  importeReembolso: number;
  costeTotal: number;
  minutosHastaInicio: number;
} {
  const costeTotal = reserva.costeEstimado || 0;

  const fechaStr = reserva.fechaReserva || reserva.fecha;
  if (!fechaStr || !reserva.horaInicio) {
    return { porcentaje: 0, importeReembolso: 0, costeTotal, minutosHastaInicio: 0 };
  }

  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const [h, m] = reserva.horaInicio.split(":").map(Number);
  const inicioReserva = new Date(anio, mes - 1, dia, h, m, 0, 0);
  const ahora = new Date();

  const minutosHastaInicio = (inicioReserva.getTime() - ahora.getTime()) / 60000;

  if (minutosHastaInicio > horasCancelacionGratuita * 60) {
    return { porcentaje: 100, importeReembolso: costeTotal, costeTotal, minutosHastaInicio };
  }
  if (minutosHastaInicio >= 360) { // 6 horas
    return { porcentaje: 50, importeReembolso: costeTotal * 0.5, costeTotal, minutosHastaInicio };
  }

  return { porcentaje: 0, importeReembolso: 0, costeTotal, minutosHastaInicio };
}
