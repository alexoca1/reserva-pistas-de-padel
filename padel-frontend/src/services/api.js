const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function fetchAPI(ruta, opciones = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...opciones.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    ...opciones,
    headers,
  });

  if (respuesta.status === 401) {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    throw new Error("No autorizado");
  }

  if (!respuesta.ok) {
    let mensaje = `Error: ${respuesta.status}`;

    try {
      const data = await respuesta.json();
      if (data?.message) mensaje = data.message;
      else if (data?.error) mensaje = data.error;
    } catch {
      // sin body JSON
    }

    throw new Error(mensaje);
  }

  // DELETE y otras respuestas sin contenido
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

  return JSON.parse(texto);
}

export const pistasService = {
  getAll: () => fetchAPI("/pistas"),
  getById: (id) => fetchAPI(`/pistas/${id}`),
  create: (datos) =>
    fetchAPI("/pistas", {
      method: "POST",
      body: JSON.stringify(datos),
    }),
  update: (id, datos) =>
    fetchAPI(`/pistas/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    }),
  delete: (id) =>
    fetchAPI(`/pistas/${id}`, {
      method: "DELETE",
    }),
};

export const reservasService = {
  getAll: () => fetchAPI("/reservas"),
  getById: (id) => fetchAPI(`/reservas/${id}`),
  create: (datos) =>
    fetchAPI("/reservas", {
      method: "POST",
      body: JSON.stringify(datos),
    }),
  update: (id, datos) =>
    fetchAPI(`/reservas/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    }),
  delete: (id) =>
    fetchAPI(`/reservas/${id}`, {
      method: "DELETE",
    }),
};
