# Plan técnico: Scroll-to-top y título de pestaña dinámico

**Spec relacionada:** ./spec.md

## Diseño

- **`Layout.tsx`**: añadir `useLocation` al import de `react-router-dom`.
  Definir `TITULOS_POR_RUTA: Record<string, string>` como constante a nivel
  de módulo (mismo patrón que `SOCIAL_LINKS`, ya existente en el archivo).
  Añadir un `useLayoutEffect` nuevo, independiente del que ya existe para
  `navbarWrapperRef`/`footerRef`, con dependencia `[location.pathname]`, que
  hace `window.scrollTo(0, 0)` y setea `document.title`.
- **`NotFoundPage.tsx`**: añadir `useEffect` (import nuevo de `"react"`) con
  array de dependencias vacío que replica la misma lógica de forma
  independiente, ya que este componente no está bajo `Layout`.

## Decisiones y alternativas descartadas

- **`<ScrollRestoration>` de React Router**: descartado — requiere Data
  Router (`createBrowserRouter`) y el proyecto usa `<BrowserRouter>`
  declarativo; migrar el router es un cambio mucho mayor, fuera de alcance.
- **Anidar `NotFoundPage` en `Layout`**: descartado — cambiaría el layout
  visual del 404 actual, y duplicar 4 líneas de efecto es más barato que ese
  riesgo.
- **`react-helmet` u otra librería de gestión de `<head>`**: descartado —
  `document.title` directo basta para un único valor; no se añade dependencia
  nueva (regla Ponytail).

## Impacto en seguridad

Ninguno.