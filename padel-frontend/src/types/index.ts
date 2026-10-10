export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  roles?: string | string[];
  enabled?: boolean;
  fechaRegistro?: string;
  avatarUrl?: string;
  tipoAdmin?: "ADMIN" | "DEMO_ADMIN" | null;
  fechaBaja?: string;
}

export interface PerfilPayload {
  nombre: string;
  apellidos: string;
  telefono?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  usuarioId?: number;
}

export type EstadoPista = "ACTIVA" | "MANTENIMIENTO";

export interface Pista {
  id: number;
  numeroPista: number;
  tieneIluminacion: boolean;
  comentarios?: string | null;
  imagenUrl?: string | null;
  precioHora?: number | null;
  estado?: EstadoPista;
  fechaAlta?: string;
  fechaModificacion?: string;
}

export interface PistaPayload {
  numeroPista: number;
  tieneIluminacion: boolean;
  comentarios: string;
  precioHora?: number;
  estado?: EstadoPista;
}

export interface Reserva {
  id: number;
  fechaReserva?: string;
  fecha?: string;
  horaInicio: string;
  horaFin: string;
  nombreJugador: string;
  telefono: string;
  estado?: string;
  fechaCancelacion?: string;
  codigoReserva?: string;
  costeEstimado?: number | null;
  pista?: Pista;
  pistaId?: number;
  numeroPista?: number;
  usuario?: Pick<Usuario, "id"> & Partial<Usuario>;
  usuarioId?: number;
}

export interface ReservaPayload {
  fechaReserva: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nombreJugador: string;
  telefono: string;
  pistaId: number;
  pista: { id: number };
  usuarioId: number;
  usuario: { id: number };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function getReservaUsuarioId(reserva: Reserva): number | null {
  return reserva?.usuario?.id ?? reserva?.usuarioId ?? null;
}

export interface FranjaOcupada {
  horaInicio: string;
  horaFin: string;
  nombreJugador: string | null;
  reservaId: number | null;
  usuarioId: number | null;
}

export interface DisponibilidadDia {
  pistaId: number;
  numeroPista: number;
  franjas: FranjaOcupada[];
  precioHora?: number | null;
  estado?: string;
}

export interface ConfiguracionDuraciones {
  duracionesPermitidas: number[];
  duracionPorDefecto: number;
}

export interface SubidaResult {
  url: string;
  publicId: string;
}

export interface FotoPista {
  id: number;
  url: string;
  publicId: string;
  esPortada: boolean;
  orden: number;
}

export interface FotoSede {
  id: number;
  url: string;
  publicId: string;
  orden: number;
}


