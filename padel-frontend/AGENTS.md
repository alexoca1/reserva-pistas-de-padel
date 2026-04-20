# AGENTS.md - Guía de Desarrollo para Padel Frontend

## 📋 Descripción General del Proyecto

Frontend de una aplicación de reservas de pistas de pádel construido con React 18 y Vite. Proporciona interfaz para autenticación de usuarios, consulta de disponibilidad de pistas y gestión de reservas.

## 🛠️ Stack Tecnológico

- **React 18**: Framework principal para UI
- **Vite**: Bundler y servidor de desarrollo
- **React Router v6**: Enrutamiento de aplicación
- **Tailwind CSS**: Estilos y diseño responsivo
- **shadcn/ui**: Componentes reutilizables de UI de alta calidad
- **JavaScript ES6+**: Sin TypeScript

## 📁 Estructura de Carpetas

```
src/
├── pages/              # Páginas/vistas principales de la aplicación
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ProfilePage.jsx
│   ├── PistasPage.jsx
│   └── ReservasPage.jsx
├── components/         # Componentes reutilizables
│   ├── ui/            # Componentes de shadcn/ui
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── PistaCard.jsx
│   ├── ReservaForm.jsx
│   └── ...
├── context/           # Context API para estado global
│   ├── AuthContext.jsx
│   ├── ReservasContext.jsx
│   └── PistasContext.jsx
├── services/          # Llamadas a API y lógica de servidor
│   ├── authService.js
│   ├── pistasService.js
│   ├── reservasService.js
│   └── api.js         # Configuración base de fetch/axios
├── App.jsx           # Componente raíz
├── main.jsx          # Punto de entrada
└── index.css         # Estilos globales
```

## 🔐 Configuración del Backend

**URL Base**: `http://localhost:8080`

**Autenticación**: JWT (JSON Web Tokens)

- Token almacenado en localStorage con clave: `authToken`
- Incluir en header `Authorization: Bearer <token>`

### 📡 Endpoints Principales

> Actualización de rutas: lo que antes se manejaba como `aulas` ahora corresponde a `pistas`, y lo que antes se manejaba como `centros` ahora corresponde a `reservas`.

| Método   | Ruta             | ¿Requiere autenticación? | ¿Requiere ROLE_ADMIN? |
| -------- | ---------------- | ------------------------ | --------------------- |
| `POST`   | `/auth/login`    | No                       | No                    |
| `POST`   | `/auth/register` | No                       | No                    |
| `GET`    | `/auth/perfil`   | Sí                       | No                    |
| `GET`    | `/pistas`        | Sí                       | No                    |
| `GET`    | `/pistas/:id`    | Sí                       | No                    |
| `POST`   | `/pistas`        | Sí                       | Sí                    |
| `PUT`    | `/pistas/:id`    | Sí                       | Sí                    |
| `DELETE` | `/pistas/:id`    | Sí                       | Sí                    |
| `GET`    | `/reservas`      | Sí                       | No                    |
| `GET`    | `/reservas/:id`  | Sí                       | No                    |
| `POST`   | `/reservas`      | Sí                       | No                    |
| `PUT`    | `/reservas/:id`  | Sí                       | No                    |
| `DELETE` | `/reservas/:id`  | Sí                       | No                    |

Notas:

- En `reservas`, el frontend permite actualizar y eliminar solo si el usuario es admin o propietario de la reserva.
- En `pistas`, crear/editar/eliminar está restringido a `ROLE_ADMIN`.

## 📝 Convenciones de Código

### Nombres

- **Componentes**: PascalCase (ej: `PistaCard.jsx`, `ReservaForm.jsx`)
- **Variables/funciones**: camelCase (ej: `obtenerPistas()`, `pistaSeleccionada`)
- **Archivos de servicios/utilidades**: camelCase (ej: `authService.js`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `API_BASE_URL`, `FECHA_FORMATO`)
- **En español**: Usar español para nombres de variables, funciones y comentarios cuando sea apropiado

### Importaciones de shadcn/ui

```javascript
// Forma correcta
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

### Estructura de Componentes

```javascript
// pages/PistasPage.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PistaCard } from "../components/PistaCard";
import { obtenerPistas } from "../services/pistasService";

export function PistasPage() {
  const [pistas, setPistas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPistas();
  }, []);

  const cargarPistas = async () => {
    try {
      setCargando(true);
      const datos = await obtenerPistas();
      setPistas(datos);
    } catch (error) {
      console.error("Error al cargar pistas:", error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Pistas Disponibles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pistas.map((pista) => (
          <PistaCard key={pista.id} pista={pista} />
        ))}
      </div>
    </div>
  );
}
```

### Servicios API

```javascript
// services/api.js
const API_BASE_URL = "http://localhost:8080";

export async function llamadaAPI(ruta, opciones = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...opciones.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    ...opciones,
    headers,
  });

  if (!respuesta.ok) {
    throw new Error(`Error: ${respuesta.status}`);
  }

  return respuesta.json();
}
```

```javascript
// services/pistasService.js
import { llamadaAPI } from "./api";

export async function obtenerPistas(fecha = null) {
  let url = "/pistas";
  if (fecha) {
    url += `?fecha=${fecha}`;
  }
  return llamadaAPI(url);
}

export async function obtenerPista(id) {
  return llamadaAPI(`/pistas/${id}`);
}

export async function crearPista(datos) {
  return llamadaAPI("/pistas", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export async function actualizarPista(id, datos) {
  return llamadaAPI(`/pistas/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export async function eliminarPista(id) {
  return llamadaAPI(`/pistas/${id}`, {
    method: "DELETE",
  });
}
```

### Context API

```javascript
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { login, registro, obtenerPerfil } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarAutenticacion();
  }, []);

  const verificarAutenticacion = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const perfil = await obtenerPerfil();
        setUsuario(perfil);
        setAutenticado(true);
      } catch (error) {
        localStorage.removeItem("authToken");
        setAutenticado(false);
      }
    }
    setCargando(false);
  };

  const iniciarSesion = async (email, contraseña) => {
    const { token, usuario } = await login(email, contraseña);
    localStorage.setItem("authToken", token);
    setUsuario(usuario);
    setAutenticado(true);
    return usuario;
  };

  const cerrarSesion = () => {
    localStorage.removeItem("authToken");
    setUsuario(null);
    setAutenticado(false);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, autenticado, cargando, iniciarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

## 🎨 Estilos Tailwind CSS

- Usar clases de Tailwind para estilos directamente
- Componentes shadcn/ui ya incluyen estilos Tailwind
- Mantener consistencia con paleta de colores del diseño
- Responsividad obligatoria: mobile-first approach

```javascript
// Ejemplo de grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## 🔄 Flujo de Datos

1. **Componentes** → Utilizan `useAuth()` y otros hooks de Context
2. **Context** → Gestiona estado global (autenticación, reservas, etc.)
3. **Servicios** → Realizan llamadas a API
4. **API** → Comunica con backend en `http://localhost:8080`

## ⚙️ Configuración Vite

- Hot Module Replacement (HMR) habilitado durante desarrollo
- Alias `@/` apunta a carpeta `src/`
- Optimizaciones de build para producción automáticas

## 📌 Patrones Comunes

### Manejo de Errores

```javascript
try {
  const datos = await obtenerPistas();
  setPistas(datos);
} catch (error) {
  console.error("Error al cargar pistas:", error);
  mostrarNotificacion("Error al cargar pistas", "error");
}
```

### Validación de Formularios

```javascript
const [errores, setErrores] = useState({});

const validarFormulario = (datos) => {
  const nuevosErrores = {};
  if (!datos.email) nuevosErrores.email = "Email requerido";
  if (!datos.contraseña) nuevosErrores.contraseña = "Contraseña requerida";
  setErrores(nuevosErrores);
  return Object.keys(nuevosErrores).length === 0;
};
```

### Protección de Rutas

```javascript
// App.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function RutaPrivada({ children }) {
  const { autenticado, cargando } = useAuth();

  if (cargando) return <div>Cargando...</div>;

  return autenticado ? children : <Navigate to="/login" replace />;
}
```

## 🚀 Buenas Prácticas

1. **Reutilización**: Crear componentes pequeños y reutilizables
2. **Separación de responsabilidades**: Servicios para API, componentes para UI
3. **Estado mínimo**: Solo guardar en Context lo verdaderamente global
4. **Manejo de errores**: Siempre usar try-catch en operaciones async
5. **Accesibilidad**: Usar componentes shadcn/ui que son accesibles por defecto
6. **Performance**: Usar `useCallback` y `useMemo` cuando sea necesario
7. **Documentación**: Comentarios claros en funciones complejas

## 📚 Recursos Útiles

- [React Docs](https://react.dev)
- [React Router v6](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vite](https://vitejs.dev)

---

**Última actualización**: Abril 2026

## Personalizado

incluye en este archivo los cambios relevantes despues de cada implemenetación que te solicite

### Cambios recientes

- Se implementó `ReservasPage` con CRUD completo usando `reservasService` y `pistasService`.
- Se añadieron componentes UI: `table`, `dialog`, `badge` y `select` en `src/components/ui/`.
- La tabla de reservas incluye scroll horizontal en móvil y columnas: fecha, horas, jugador, teléfono, pista y acciones.
- Se agregaron modales para crear/editar reserva y confirmar eliminación.
- El formulario de reserva carga pistas disponibles con `pistasService.getAll()` y permite seleccionar el número de pista.
- Se añadió control de roles en frontend: `ROLE_ADMIN` puede crear/editar/eliminar pistas; `ROLE_USER` solo visualiza pistas.
- En reservas, los datos sensibles (`jugador`, `telefono`) se muestran completos para admin y para el propietario de la reserva; para el resto se muestran como `Privado`.
- En reservas, solo admin o propietario pueden editar/eliminar una reserva; el resto de usuarios ve `Sin permisos` en acciones.
- Al crear una reserva, `nombreJugador` se autocompleta con el usuario autenticado y se envía también referencia de usuario (`usuarioId` y `usuario.id`) junto a la reserva.
- Se añadieron validaciones de negocio en `ReservasPage` para impedir crear reservas con fecha pasada.
- Si la reserva es para el mismo día, la hora de inicio debe ser mínimo 2 horas superior a la hora actual.
- Se aplicó restricción de horario operativo: inicio desde `06:00` y fin hasta `23:00`.
- Se validó que la hora de fin siempre sea posterior a la hora de inicio.
- En el listado de reservas, se filtran y ocultan reservas de días anteriores al día de la consulta.
- Se mejoró `Navbar` para ser totalmente responsive: en móvil usa botón hamburguesa con menú vertical desplegable y en escritorio mantiene navegación horizontal.
- Se creó `PROMPTS.md` con estructura en markdown para documentar prompts clave por secciones: configuración inicial, backend, autenticación, páginas principales, CRUD y diseño visual.
- Se implementó `NotFoundPage` (404) con diseño centrado, número grande estilizado con Tailwind y botón de `shadcn/ui` para volver al inicio usando `useNavigate`.
- Se generó un `README.md` completo del sistema (backend Spring Boot + frontend React/Vite) con tecnologías, requisitos previos, instalación/ejecución paso a paso, estructura de carpetas y endpoints principales de la API.
