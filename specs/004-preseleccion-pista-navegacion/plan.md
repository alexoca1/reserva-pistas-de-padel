# Plan técnico: Preselección de pista al navegar de Pistas a Reservas

**Spec relacionada:** ./spec.md

## Diseño

- **`PistasPage.tsx`**: en los dos botones "Reservar" existentes (vista tarjeta
  móvil y vista tabla escritorio), cambiar
  `navigate(isAuthenticated ? "/reservas" : "/login")` por
  `navigate(isAuthenticated ? "/reservas" : "/login", isAuthenticated ? { state: { pistaId: pista.id } } : undefined)`.
- **`ReservasPage.tsx`**: usar `useLocation()` de `react-router-dom` para leer
  `location.state?.pistaId` e inicializar `pistaSeleccionada` con ese valor
  mediante el inicializador de `useState`, en vez de `null` fijo.
- No se introduce ningún estado nuevo — se reutiliza `pistaSeleccionada`,
  ya existente desde la spec 003.

## Decisiones y alternativas descartadas

- **Query param (`/reservas?pistaId=X`) en vez de `location.state`**: descartado
  porque un query param persiste en la URL y sobrevive a recargas (RF-05 no se
  cumpliría), y ensucia la URL para un filtro que es solo comodidad de
  navegación, no un estado que deba ser compartible o bookmarkeable.
- **Context global de "pista en foco"**: descartado por sobreingeniería —
  `location.state` es exactamente para este caso de uso y no añade dependencia
  ni provider nuevo.

## Impacto en seguridad

Ninguno — es un valor puramente de UI, no viaja al backend ni se valida como dato de negocio.