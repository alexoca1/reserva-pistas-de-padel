import type {
  DisponibilidadDia,
  FotoPista,
  FotoSede,
  FranjaOcupada,
  PerfilPayload,
  Pista,
  PistaPayload,
  Reserva,
  ReservaPayload,
  SubidaResult,
  Usuario,
} from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const MENSAJE_DEMO_NO_DISPONIBLE =
  "Demo temporalmente no disponible. Por favor, inténtalo de nuevo en unos minutos.";

let memoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let ultimoAvisoLento = 0;

function iniciarDetectorLentitud(): () => void {
  const timeoutId = setTimeout(() => {
    const ahora = Date.now();
    if (ahora - ultimoAvisoLento > 12000) {
      ultimoAvisoLento = ahora;
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: {
            mensaje: "El servidor se está despertando, puede tardar unos segundos",
          },
        })
      );
    }
  }, 4000);

  return () => clearTimeout(timeoutId);
}

async function ejecutarFetchConDetector(url: string, init: RequestInit): Promise<Response> {
  const cancelarDetector = iniciarDetectorLentitud();
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(MENSAJE_DEMO_NO_DISPONIBLE);
  } finally {
    cancelarDetector();
  }
}

export function setMemoryAccessToken(token: string | null) {
  memoryAccessToken = token;
}

export function getMemoryAccessToken(): string | null {
  return memoryAccessToken;
}

export async function refreshSession(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const cancelarDetector = iniciarDetectorLentitud();
    try {
      const respuesta = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!respuesta.ok) {
        setMemoryAccessToken(null);
        return null;
      }

      const data = (await respuesta.json()) as { accessToken?: string; token?: string };
      const nuevoToken = data.accessToken || data.token || null;
      setMemoryAccessToken(nuevoToken);
      return nuevoToken;
    } catch {
      setMemoryAccessToken(null);
      return null;
    } finally {
      cancelarDetector();
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchAPI<T>(ruta: string, opciones: RequestInit = {}, esReintento = false): Promise<T | null> {
  const headers: Record<string, string> = {};

  if (!(opciones.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (opciones.headers) {
    new Headers(opciones.headers).forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (memoryAccessToken) {
    headers.Authorization = `Bearer ${memoryAccessToken}`;
  }

  const respuesta = await ejecutarFetchConDetector(`${API_BASE_URL}${ruta}`, {
    ...opciones,
    headers,
    credentials: "include",
  });

  if (respuesta.status === 401 && !esReintento) {
    const nuevoToken = await refreshSession();
    if (nuevoToken) {
      return fetchAPI<T>(ruta, opciones, true);
    }

    // Sesión expirada y no se pudo refrescar
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    throw new Error("Sesión no autorizada o expirada");
  }

  if (respuesta.status >= 500) {
    throw new Error(MENSAJE_DEMO_NO_DISPONIBLE);
  }

  if (!respuesta.ok) {
    let mensaje = `Error: ${respuesta.status}`;

    try {
      const data = (await respuesta.json()) as { message?: string; error?: string; password?: string };
      if (data?.password) mensaje = data.password;
      else if (data?.message) mensaje = data.message;
      else if (data?.error) mensaje = data.error;
    } catch {
      // sin body JSON
    }

    throw new Error(mensaje);
  }

  if (respuesta.status === 204) {
    return null;
  }

  const contentType = respuesta.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  const texto = await respuesta.text();
  if (!texto) {
    return null;
  }

  return JSON.parse(texto) as T;
}

export const pistasService = {
  getAll: () => fetchAPI<Pista[]>("/pistas"),
  getById: (id: number) => fetchAPI<Pista>(`/pistas/${id}`),
  create: (datos: PistaPayload) =>
    fetchAPI<Pista>("/pistas", {
      method: "POST",
      body: JSON.stringify(datos),
    }),
  update: (id: number, datos: PistaPayload) =>
    fetchAPI<Pista>(`/pistas/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    }),
  delete: (id: number) =>
    fetchAPI<null>(`/pistas/${id}`, {
      method: "DELETE",
    }),
};

export const reservasService = {
  getAll: () => fetchAPI<Reserva[]>("/reservas"),
  getById: (id: number) => fetchAPI<Reserva>(`/reservas/${id}`),
  getDisponibilidad: (pistaId: number, fecha: string) =>
    fetchAPI<FranjaOcupada[]>(`/reservas/disponibilidad?pistaId=${pistaId}&fecha=${fecha}`),
  getDisponibilidadDia: (fecha: string) =>
    fetchAPI<DisponibilidadDia[]>(`/reservas/disponibilidad-dia?fecha=${fecha}`),
  create: (datos: ReservaPayload) =>
    fetchAPI<Reserva>("/reservas", {
      method: "POST",
      body: JSON.stringify(datos),
    }),
  update: (id: number, datos: ReservaPayload) =>
    fetchAPI<Reserva>(`/reservas/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    }),
  delete: (id: number) =>
    fetchAPI<null>(`/reservas/${id}`, {
      method: "DELETE",
    }),
};

export const usuariosService = {
  getAll: () => fetchAPI<Usuario[]>("/auth/usuarios"),
};

export const perfilService = {
  actualizar: (datos: PerfilPayload) =>
    fetchAPI<Usuario>("/auth/perfil", {
      method: "PUT",
      body: JSON.stringify(datos),
    }),
  subirAvatar: (file: File): Promise<{ avatarUrl: string }> => {
    const fd = new FormData();
    fd.append("file", file);
    return fetchAPI<{ avatarUrl: string }>("/auth/perfil/avatar", {
      method: "PUT",
      body: fd,
    }) as Promise<{ avatarUrl: string }>;
  },
  getMisDatos: () =>
    fetchAPI<Record<string, unknown>>("/auth/mis-datos", {
      method: "GET",
    }),
  eliminarCuenta: () =>
    fetchAPI<void>("/auth/cuenta", {
      method: "DELETE",
    }),
};

export const configuracionService = {
  getDuraciones: () =>
    fetchAPI<{ duracionesPermitidas: number[]; duracionPorDefecto: number }>(
      "/configuracion/duraciones"
    ),
};

export const uploadService = {
  subir: (file: File): Promise<SubidaResult> => {
    const formData = new FormData();
    formData.append("file", file);
    // No añadir Content-Type manualmente — el navegador lo pone
    // con el boundary correcto cuando el body es FormData
    return fetchAPI<SubidaResult>("/upload", {
      method: "POST",
      body: formData,
    }) as Promise<SubidaResult>;
  },
};

export const fotoPistaService = {
  getAll: (pistaId: number) =>
    fetchAPI<FotoPista[]>(`/pistas/${pistaId}/fotos`),

  subir: (pistaId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchAPI<FotoPista>(`/pistas/${pistaId}/fotos`, {
      method: "POST",
      body: formData,
    });
  },

  eliminar: (pistaId: number, fotoId: number) =>
    fetchAPI(`/pistas/${pistaId}/fotos/${fotoId}`, { method: "DELETE" }),

  setPortada: (pistaId: number, fotoId: number) =>
    fetchAPI(`/pistas/${pistaId}/fotos/${fotoId}/portada`, { method: "PUT" }),
};

export const fotoSedeService = {
  getAll: () => fetchAPI<FotoSede[]>("/sede/fotos"),

  subir: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetchAPI<FotoSede>("/sede/fotos", {
      method: "POST",
      body: fd,
    });
  },

  eliminar: (id: number) =>
    fetchAPI(`/sede/fotos/${id}`, { method: "DELETE" }),
};
