# Spec: Configuración del club (ConfiguracionClub)

**Estado:** Borrador

## Resumen
Los límites de duración de reserva, máximo por día, horario de
apertura/cierre y antelación máxima están hoy hardcodeados en
`ReservaService` con un comentario `ponytail:` que señala esta spec.
Se extrae una entidad `ConfiguracionClub` con un único registro en base
de datos, editable solo por admin, que centraliza esos parámetros.

## Escenarios
- Como administrador, quiero cambiar el horario de apertura del club sin
  tocar código, para adaptarlo a temporadas o festivos.
- Como administrador, quiero ajustar la duración máxima permitida por
  reserva (ej. bajar a 90 min en horas pico) desde el panel, no desde
  el servidor.
- Como usuario, quiero que las reglas que el sistema aplica reflejen
  siempre la configuración real del club.

## Requisitos funcionales
- RF-01: Existe exactamente un registro de `ConfiguracionClub` en base
  de datos. Se crea con valores por defecto en `DataInitializer` si no
  existe al arrancar.
- RF-02: Los parámetros configurables son:
  - `duracionMinimaMinutos` (default 60)
  - `duracionesPermitidasMinutos` (default [60, 90, 120])
  - `duracionPorDefectoMinutos` (default 90)
  - `maximoMinutosPorDia` (default 120)
  - `horaApertura` (default 09:00)
  - `horaCierre` (default 23:00)
  - `diasAntelacionMaxima` (default 7)
- RF-03: `GET /admin/configuracion` devuelve la configuración actual.
  Solo accesible con `ROLE_ADMIN`.
- RF-04: `PUT /admin/configuracion` actualiza la configuración.
  Solo accesible con `ROLE_ADMIN`.
- RF-05: `ReservaService` lee la configuración en cada operación, no
  en el arranque, para que los cambios del admin sean inmediatos.
- RF-06: El frontend muestra las duraciones permitidas dinámicamente
  (las obtiene del backend, no las tiene hardcodeadas).

## Fuera de alcance
- Histórico de cambios de configuración.
- Configuración por pista (todas comparten la misma configuración del club).
- Configuración de precios.

## Preguntas abiertas
Ninguna.