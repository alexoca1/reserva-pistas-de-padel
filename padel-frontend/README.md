<!--
  Copyright (c) 2026 Alexander Ocampo Hernandez
  Licencia: CC BY-NC-SA 4.0 — ver LICENSE en la raíz del repositorio
  Repositorio: https://github.com/alexoca1/reserva-pistas-de-padel
-->

# Padel Reservas - Frontend

Interfaz de usuario en React + TypeScript + Vite.

Para instalación completa del proyecto (backend incluido), requisitos previos,
variables de entorno, tabla de endpoints de la API y detalle de seguridad de
autenticación, ver el [README de la raíz](../README.md) — esa es la fuente
única de verdad para todo lo anterior.

## Instalación rápida (solo frontend)

Con el backend ya corriendo en `http://localhost:8081` (ver README raíz):

```bash
cd padel-frontend
npm install
```

Crea `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:8081
```

```bash
npm run dev
```

Abre `http://localhost:5173`.

## Scripts disponibles

- `npm run dev` - inicia servidor de desarrollo Vite.
- `npm run build` - ejecuta `tsc -b` (validación de tipos) y después genera el build de producción.
- `npm run preview` - previsualiza build generado.
- `npm run lint` - ejecuta ESLint.

## TypeScript

El frontend está migrado completamente a TypeScript: los componentes usan
`.tsx`, los servicios y contratos usan `.ts`, y los tipos de dominio se
centralizan en `src/types/index.ts`. El compilador usa modo estricto
(`tsconfig.app.json`).

## Estructura de carpetas

```text
padel-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── CuadriculaDisponibilidad.tsx
│   │   ├── HeroScene.tsx
│   │   ├── icons.tsx
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── TiltCard.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── lib/
│   │   ├── fechas.ts
│   │   └── motion.ts
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── PistasPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ReservasPage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
