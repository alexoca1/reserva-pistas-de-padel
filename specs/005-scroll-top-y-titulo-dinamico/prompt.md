# Prompt de implementación — spec 005

Implementa specs/005-scroll-top-y-titulo-dinamico siguiendo spec.md, plan.md
y tasks.md (T01-T04). Contexto: el proyecto sigue la constitución en
.specify/memory/constitution.md — cambios mínimos, sin dependencias nuevas.

1. En padel-frontend/src/components/Layout.tsx:
   - Cambia el import `import { Link, Outlet } from "react-router-dom";`
     por `import { Link, Outlet, useLocation } from "react-router-dom";`
   - Añade esta constante a nivel de módulo, antes de `export function Layout()`:
```ts
     const TITULOS_POR_RUTA: Record<string, string> = {
       "/": "Inicio",
       "/login": "Iniciar sesión",
       "/register": "Crear cuenta",
       "/dashboard": "Dashboard",
       "/pistas": "Pistas",
       "/reservas": "Reservas",
     };
```
   - Dentro del componente `Layout`, añade `const location = useLocation();`
     junto a los `useRef` existentes.
   - Añade un `useLayoutEffect` nuevo (independiente del que ya existe para
     `navbarWrapperRef`/`footerRef`):
```ts
     useLayoutEffect(() => {
       window.scrollTo(0, 0);
       const titulo = TITULOS_POR_RUTA[location.pathname];
       document.title =
         location.pathname === "/"
           ? "Pádel Reservas"
           : titulo
             ? `${titulo} · Pádel Reservas`
             : "Pádel Reservas";
     }, [location.pathname]);
```

2. En padel-frontend/src/pages/NotFoundPage.tsx:
   - Añade `import { useEffect } from "react";` al inicio del archivo.
   - Dentro del componente, antes del `return`, añade:
```ts
     useEffect(() => {
       document.title = "Página no encontrada · Pádel Reservas";
       window.scrollTo(0, 0);
     }, []);
```

3. No toques el backend, no toques ningún otro archivo, no añadas dependencias.

Verificación: navega por todas las rutas de la app (Home, Login, Register,
Dashboard, Pistas, Reservas) y confirma que el título de la pestaña cambia
en cada una según el mapa. Baja el scroll en una página larga (ej. Home) y
navega a otra ruta: debe aparecer arriba del todo. Entra a una URL inexistente
(ej. /esto-no-existe) y confirma que el título pasa a
"Página no encontrada · Pádel Reservas".