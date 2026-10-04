# Spec: Corrección de autorización en Reservas y Admin

**Estado:** Implementado

## Resumen
Una revisión de seguridad detectó tres fallos de control de acceso en la API: los usuarios veían las reservas de todos, cualquiera podía autopromoverse a administrador, y el manejador global de excepciones estaba desconectado. Esta spec cierra los tres.

## Escenarios

- Como usuario autenticado con `ROLE_USER`, quiero que `GET /reservas` me devuelva solo mis propias reservas, para que no se filtren mi nombre y teléfono junto con los de otros jugadores.
- Como administrador, quiero que solo un administrador ya autenticado pueda crear otros administradores, para que nadie se autopromueva a `ROLE_ADMIN` sin autorización.
- Como agente/desarrollador que consume la API, quiero que los errores de validación y de acceso denegado tengan un formato de respuesta consistente, para depurar más rápido y dar mejores mensajes al frontend.

## Requisitos funcionales

- RF-01: `GET /reservas` devuelve solo las reservas del usuario autenticado; si tiene `ROLE_ADMIN`, devuelve todas.
- RF-02: `POST /auth/register-admin` requiere autenticación y `ROLE_ADMIN`.
- RF-03: Las excepciones de validación (`@Valid`) devuelven `400` con un mapa `campo -> mensaje`.
- RF-04: Las excepciones no controladas devuelven `500` con un mensaje de error genérico.
- RF-05: Las excepciones de acceso denegado (`AccessDeniedException`) devuelven `403` de forma explícita, no el error genérico.

## Fuera de alcance

- No se cambia el modelo de datos ni las entidades.
- No se modifica el admin semilla que crea `DataInitializer`.
- No se añade rate-limiting ni auditoría/logging de accesos.
- No se toca la lógica de `GET /reservas/{id}`, `PUT`, `DELETE` — ya filtraban correctamente por usuario.

## Preguntas abiertas

Ninguna — spec cerrada, implementación y tests ya validados.