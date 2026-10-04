# Spec: Preselección de pista al navegar de Pistas a Reservas

**Estado:** Completado

## Resumen
El botón "Reservar" en la página de Pistas navega a Reservas sin contexto, obligando
al usuario a volver a localizar la misma pista en la cuadrícula. Esta spec pasa la
pista de origen como estado de navegación para que la cuadrícula se abra ya filtrada.

## Escenarios

- Como usuario, al pulsar "Reservar" en una pista concreta desde `/pistas`, quiero
  llegar a `/reservas` con esa pista ya seleccionada, para no tener que buscarla de nuevo.
- Como usuario que navega a `/reservas` desde cualquier otro sitio (menú, URL directa),
  quiero ver todas las pistas por defecto, sin ningún filtro aplicado.

## Requisitos funcionales

- RF-01: El botón "Reservar" de `PistasPage` navega a `/reservas` pasando el `id`
  de la pista como estado de navegación (`location.state`), no como query param
  ni en la URL.
- RF-02: `ReservasPage`, al montar, lee ese estado y, si existe, inicializa
  `pistaSeleccionada` con ese valor.
- RF-03: El filtro de pista preseleccionado es el mismo estado `pistaSeleccionada`
  que ya existe para el selector de pista en móvil (spec 003) — no se crea un
  estado paralelo.
- RF-04: Si se navega a `/reservas` sin estado (menú, recarga, URL directa),
  `pistaSeleccionada` queda en `null` (todas las pistas), comportamiento actual.
- RF-05: Recargar la página (F5) en `/reservas` no re-aplica el filtro —
  `location.state` no sobrevive a un refresh completo, y esa pérdida es aceptable.

## Fuera de alcance

- Persistir el filtro de pista en la URL o en `localStorage`.
- Aplicar preselección también a la fecha (`fechaVista`) — solo pista.
- Cambios en el backend.

## Preguntas abiertas

Ninguna.