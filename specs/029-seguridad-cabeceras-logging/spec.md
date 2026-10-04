# Spec 029 — Seguridad: cabeceras HTTP y logging de auditoría

**Estado:** implementada  
**Fecha:** 2026-10-02  
**Afecta:** solo backend (`SecurityConfig.java`, nuevo `SecurityAuditService.java`, `AuthController.java`)

---

## Contexto

El proyecto carece de dos capas de defensa en profundidad habituales en
aplicaciones web en producción:

1. **Cabeceras de seguridad HTTP** que el navegador interpreta para mitigar
   ataques comunes (XSS, clickjacking, MIME sniffing, etc.).
2. **Logging de auditoría** para acciones sensibles de autenticación, necesario
   para trazabilidad en caso de incidente de seguridad.

Ambas mejoras son puramente de backend, no tocan el frontend y no añaden
dependencias nuevas (Spring Security 6 gestiona las cabeceras nativamente;
SLF4J ya es una dependencia transitiva de Spring Boot).

---

## Requisitos funcionales

### Parte A — Cabeceras HTTP de seguridad

Al responder cualquier petición HTTP, el servidor debe incluir:

| Cabecera | Valor |
|---|---|
| `Content-Security-Policy` | `default-src 'self'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=()` |

Implementación mediante `http.headers()` de Spring Security 6 — sin filtros
propios ni dependencias nuevas.

### Parte B — Logging de auditoría

Crear `SecurityAuditService.java` en `com.padel.reservas.services` que
registre mediante SLF4J:

| Evento | Nivel | Datos |
|---|---|---|
| Login exitoso | INFO | email, timestamp |
| Login fallido | WARN | email intentado, timestamp |
| Logout | INFO | email (si disponible), timestamp |
| Cambio de contraseña | INFO | email del usuario afectado, timestamp |
| Cambio de email | INFO | email antiguo → email nuevo, timestamp |
| Subida de avatar | INFO | email, timestamp |

`AuthController` inyecta `SecurityAuditService` y llama al método
correspondiente en cada acción.

---

## Tareas

- **T01** — `SecurityConfig.java`: añadir bloque `headers()` con las 5 cabeceras.
- **T02** — Crear `SecurityAuditService.java`.
- **T03** — `AuthController.java`: inyectar el servicio y añadir llamadas de auditoría.
- **T04** — Test: `SecurityAuditServiceTest.java` que verifique que los métodos
  del servicio llaman al logger con el nivel correcto.
- **T05** — Actualizar `padel-backend/AGENTS.md`.
