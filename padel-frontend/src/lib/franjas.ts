const MINUTOS_POR_FRANJA = 30;

export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Etiquetas "HH:mm" de las franjas de 30 min que cubre una reserva. */
export function franjasDeReserva(horaInicio: string, horaFin: string): string[] {
  const franjas: string[] = [];
  const minutosFin = horaAMinutos(horaFin);
  for (let m = horaAMinutos(horaInicio); m < minutosFin; m += MINUTOS_POR_FRANJA) {
    franjas.push(minutosAHora(m));
  }
  return franjas;
}

/** Suma minutos a una hora "HH:mm" y devuelve el resultado en el mismo formato. */
export function sumarMinutos(hora: string, minutos: number): string {
  return minutosAHora(horaAMinutos(hora) + minutos);
}
