# Tareas: Scroll-to-top y título de pestaña dinámico

- [x] T01 - En `Layout.tsx`, añadir `useLocation` al import de `react-router-dom`
- [x] T02 - En `Layout.tsx`, definir la constante `TITULOS_POR_RUTA` a nivel de módulo
- [x] T03 - En `Layout.tsx`, añadir `useLayoutEffect` con `[location.pathname]` para scroll-to-top y `document.title`
- [x] T04 - En `NotFoundPage.tsx`, añadir `useEffect` con array vacío para su propio título y scroll-to-top
- [x] T05 - Verificación manual: navegar por todas las rutas confirmando título y scroll; forzar una URL inválida y confirmar el título del 404