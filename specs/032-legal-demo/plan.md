# Plan técnico: Spec 032 — Aviso Legal, Banner de Demo y Cumplimiento RGPD

**Spec relacionada:** `../spec.md`

---

## Diseño de componentes y arquitectura

### 1. Árbol de componentes afectados
```text
App
├── DemoBanner (permanente, nivel superior)
├── Routes
│   ├── Layout (rutas anidadas con Navbar y Footer)
│   │   ├── HomePage (/)
│   │   ├── LoginPage (/login)
│   │   ├── RegisterPage (/register)
│   │   ├── PrivacidadPage (/privacidad)   <-- NUEVO
│   │   ├── TerminosPage (/terminos)       <-- NUEVO
│   │   ├── PistasPage (/pistas)
│   │   ├── InstalacionesPage (/instalaciones)
│   │   ├── DashboardPage (/dashboard - protegido)
│   │   ├── ReservasPage (/reservas - protegido)
│   │   └── PerfilPage (/perfil - protegido)
│   └── NotFoundPage (*)
└── CookieBanner (persistente en localStorage, dentro de BrowserRouter)
```

### 2. Componentes nuevos
- `src/components/DemoBanner.tsx`:
  - Barra informativa estática, sin estado propio.
  - Link externo con `rel="noopener noreferrer"`.
- `src/components/CookieBanner.tsx`:
  - Lee y escribe `localStorage.getItem("cookie_consent")`.
  - Animación suave de entrada/salida vía `framer-motion` o renderizado condicional.
  - Utiliza `useNavigate` de `react-router-dom` para el botón "Ver política".
- `src/pages/PrivacidadPage.tsx`:
  - Estructurado en bloques temáticos usando `Card`, `CardHeader`, `CardTitle`, `CardContent`.
  - Iconos y tipografía del sistema de diseño (Outfit/Inter, glassmorphic styling).
- `src/pages/TerminosPage.tsx`:
  - Estructura paralela a `PrivacidadPage`.
  - Cita la política de cancelación de reservas con antelación mínima (spec 020).

### 3. Componentes modificados
- `src/components/Layout.tsx`:
  - `TITULOS_POR_RUTA`: incorporar las dos nuevas rutas.
  - `Footer`: añadir enlaces a `/privacidad` y `/terminos`.
- `src/App.tsx`:
  - Enlazar `DemoBanner`, `CookieBanner`, `PrivacidadPage`, `TerminosPage`.

---

## Decisiones y alternativas descartadas

1. **¿Poner `DemoBanner` dentro de `Layout.tsx` vs `App.tsx`?**
   - *Decisión:* `App.tsx`.
   - *Motivo:* Si estuviera dentro de `Layout`, no se mostraría en la página de error 404 (`NotFoundPage`), que se renderiza fuera de `Layout`. Colocarlo en `App.tsx` asegura presencia global ininterrumpida.

2. **¿Gestor complejo de consentimiento de cookies (CMP) vs banner ligero con `localStorage`?**
   - *Decisión:* Banner ligero autónomo con `localStorage`.
   - *Motivo:* Filosofía Ponytail (Artículo 1 de la Constitución). La app solo utiliza cookies técnicas (la cookie HttpOnly de refresh token y tokens de sesión), sin rastreadores de analítica de terceros. Un CMP externo añadiría dependencias innecesarias y peso excesivo.

3. **¿Carga diferida o estática de las páginas legales?**
   - *Decisión:* Importación directa estándar consistente con el resto de páginas en `App.tsx`.

---

## Impacto en seguridad y privacidad
- Cumple con los requisitos de transparencia del RGPD (artículos 12, 13 y 14) y la LSSI-CE española (artículo 10).
- No recopila información adicional ni rastrea a los usuarios.
