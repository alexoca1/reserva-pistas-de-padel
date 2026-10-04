# Arquitectura - Reserva Pistas de Pádel

## 📋 Descripción General

**Reserva Pistas de Pádel** es una aplicación full-stack para la gestión integral de reservas de pistas de pádel. El sistema permite a usuarios registrarse, autenticarse, consultar pistas disponibles y crear/gestionar reservas en tiempo real. Los administradores tienen control total sobre pistas y reservas del sistema.

### Características Principales

- ✅ **Autenticación Robusta**: Access Token JWT en memoria de React (15 min) + Refresh Token en Cookie `HttpOnly` rotativa (7 días) con detección de reutilización.
- ✅ **Protección XSS**: Inmunidad total contra robo de tokens JavaScript al no almacenar credenciales en `localStorage`/`sessionStorage`.
- ✅ **Control de acceso basado en roles** (`ROLE_ADMIN`, `ROLE_USER`).
- ✅ **Gestión completa de pistas de pádel** (CRUD y galería de fotos por pista con sincronización de portada).
- ✅ **Galería de fotos de la sede** e instalaciones públicas.
- ✅ **Avatares personalizados** con generación determinista de iniciales SVG y subida de fotos.
- ✅ **Integración con Cloudinary**: Optimización automática WebP y borrado en cascada (RGPD).
- ✅ **Mantenimiento Programado**: Limpieza diaria automatizada de refresh tokens expirados (`@Scheduled`).
- ✅ **Creación, edición y cancelación de reservas**.
- ✅ **Interfaz responsive** con React 19, TypeScript y Tailwind CSS.
- ✅ **API REST** desarrollada en Spring Boot 3 / Java 21 y MySQL.

---

## 🏗️ Arquitectura General

```text
[ React Frontend (Vite / TypeScript) ]
    │
    ├── Access Token (Memoria React / api.ts) ──> Authorization: Bearer <accessToken>
    └── Refresh Token (Cookie HttpOnly) ───────> POST /auth/refresh
            │
            ▼
[ Spring Boot API REST (Port 8081) ]
    ├── SecurityConfig (OAuth2 Resource Server + JWT Decoder)
    ├── AuthController (/auth/login, /auth/refresh, /auth/logout, /auth/perfil, /auth/perfil/avatar)
    ├── RefreshTokenService (Rotación & Detección de Reutilización + @Scheduled 03:00 AM)
    ├── CloudinaryService (Subida optimizada WebP + Borrado RGPD)
    ├── FotoPistaController / SedeController / UploadController
    └── Controladores de Dominio (/pistas, /reservas)
            │
            ├── Base de Datos MySQL (padel_reservas)
            └── Cloudinary CDN (padel-calatrava/)
```

---

## Licencia

Este proyecto está protegido bajo la licencia
**[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)**.

Ver el archivo [`LICENSE`](./LICENSE) en la raíz del repositorio para el texto legal completo.

**Copyright (c) 2026 Alexander Ocampo Hernandez**
