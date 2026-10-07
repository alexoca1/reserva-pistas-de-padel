# Padel Reservas - Backend + Frontend

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

Aplicación completa para la gestión de reservas de pistas de pádel.

El sistema está compuesto por dos partes:

- Backend con Spring Boot (API REST, JWT, MySQL).
- Frontend con React + Vite (interfaz de usuario).

## Descripción del proyecto

La aplicación permite:

- Registro e inicio de sesión de usuarios.
- Gestión de perfil autenticado.
- Consulta pública de pistas de pádel disponibles (con o sin inicio de sesión).
- Creación, edición y eliminación de reservas.
- Control por roles (`ROLE_ADMIN` y `ROLE_USER`) para proteger operaciones sensibles.

Puertos y base de datos del entorno local:

- Backend: `http://localhost:8081`
- Frontend: `http://localhost:5173`
- MySQL: `localhost:3306`
- phpMyAdmin: `http://localhost:8090`
- Base de datos: `padel_reservas`

## Acceso de demostración

Para evaluar la aplicación y explorar el panel de administración sin riesgo de alterar los datos de prueba, se incluye un usuario con rol de demostración:

| Rol | Email | Contraseña | Permisos |
| --- | --- | --- | --- |
| **Demo Admin** | `demo@padelreservas.es` | `Demo2026!` | Exploración completa del panel de administración, creación/edición de reservas y subida de imágenes. Operaciones destructivas y reconfiguración protegidas por Spring AOP (`@NoDemoAdmin`). |
| **Usuario Estándar** | `prueba1@gmail.com` | `1234567` | Gestión de reservas propias y perfil. |

> 🔒 **Protección en Backend:** El usuario `DEMO_ADMIN` cuenta con salvaguardas mediante Programación Orientada a Aspectos (Spring AOP) en el backend. Las peticiones a operaciones restringidas (borrado de pistas, borrado de reservas, reconfiguración del club) responden con HTTP `403 Forbidden` (`"Acción no disponible en modo demostración."`).

## Tecnologías usadas

- Java + Spring Boot
- Spring Security + JWT
- MySQL
- React
- Vite
- Tailwind CSS

## Requisitos previos

- Java 17 o superior
- Maven 3.9 o superior
- MySQL 8+
- Node.js 18+ (recomendado 20 LTS)
- npm 9+
- Git

## Instalación y ejecución

## 1) Backend (Spring Boot)

1. Clona o abre el proyecto en tu máquina.
2. Ve a la carpeta del backend:

```bash
cd padel-backend
```

3. Crea la base de datos en MySQL:

```sql
CREATE DATABASE padel_reservas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Configura `application.properties` (o `application.yml`) con tu conexión local:

```properties
server.port=8081

spring.datasource.url=jdbc:mysql://localhost:3306/padel_reservas?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

5. Ejecuta la aplicación backend:

```bash
mvn spring-boot:run
```

6. Verifica que está arriba en:

```text
http://localhost:8081
```

## 2) Frontend (React + Vite)

1. Ve a la carpeta del frontend:

```bash
cd padel-frontend
```

2. Instala dependencias:

```bash
npm install
```

3. Crea el archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:8081
```

4. Ejecuta el frontend:

```bash
npm run dev
```

5. Abre en navegador:

```text
http://localhost:5173
```

## Scripts disponibles (frontend)

- `npm run dev` - inicia servidor de desarrollo Vite.
- `npm run build` - genera build de producción.
- `npm run preview` - previsualiza build generado.
- `npm run lint` - ejecuta ESLint.

## Estructura de carpetas

## Backend (Spring Boot)

Estructura del backend:

```text
padel-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/padel/reservas/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── entities/
│   │   │       ├── exception/
│   │   │       ├── repositories/
│   │   │       └── services/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## Frontend (React + Vite)

Estructura actual del proyecto:

```text
padel-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   └── table.tsx
│   │   ├── Avatar.tsx
│   │   ├── BuscadorJugador.tsx
│   │   ├── CuadriculaDisponibilidad.tsx
│   │   ├── GaleriaSedeAdmin.tsx
│   │   ├── HeroScene.tsx
│   │   ├── icons.tsx
│   │   ├── Layout.tsx
│   │   ├── LightboxGaleria.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── TarjetaReserva.tsx
│   │   └── TiltCard.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── lib/
│   │   ├── fechas.ts
│   │   ├── franjas.ts
│   │   └── motion.ts
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── InstalacionesPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── PerfilPage.tsx
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

## Endpoints principales de la API

| Método   | Ruta                                      | ¿Requiere autenticación? | ¿Requiere ROLE_ADMIN? | Descripción |
| -------- | ----------------------------------------- | ------------------------ | --------------------- | ----------- |
| `POST`   | `/auth/login`                             | No                       | No                    | Inicio de sesión y emisión de tokens |
| `POST`   | `/auth/refresh`                           | No (valida cookie)       | No                    | Rotación silenciosa de tokens |
| `POST`   | `/auth/logout`                            | No                       | No                    | Revocación de refresh token y cierre |
| `POST`   | `/auth/register`                          | No                       | No                    | Registro de nuevo usuario |
| `POST`   | `/auth/register-admin`                    | **Sí**                   | **Sí**                | Registro de administrador |
| `GET`    | `/auth/perfil`                            | Sí                       | No                    | Obtiene datos del perfil autenticado |
| `GET`    | `/auth/usuarios`                          | Sí                       | Sí                    | Listado completo de usuarios |
| `PUT`    | `/auth/perfil`                            | Sí                       | No                    | Actualiza datos de perfil / password |
| `PUT`    | `/auth/perfil/avatar`                     | Sí                       | No                    | Sube y actualiza foto de avatar a Cloudinary |
| `POST`   | `/upload`                                 | Sí                       | No                    | Subida general optimizada a Cloudinary |
| `GET`    | `/pistas`                                 | **No**                   | No                    | Listado público de pistas |
| `GET`    | `/pistas/:id`                             | **No**                   | No                    | Detalle de pista |
| `POST`   | `/pistas`                                 | Sí                       | Sí                    | Creación de pista |
| `PUT`    | `/pistas/:id`                             | Sí                       | Sí                    | Edición de pista |
| `DELETE` | `/pistas/:id`                             | Sí                       | Sí                    | Eliminación en cascada y borrado RGPD |
| `GET`    | `/pistas/:pistaId/fotos`                  | **No**                   | No                    | Listado público de fotos de la pista |
| `POST`   | `/pistas/:pistaId/fotos`                  | Sí                       | Sí                    | Subida de foto a pista (máx 5) |
| `DELETE` | `/pistas/:pistaId/fotos/:fotoId`          | Sí                       | Sí                    | Borrado de foto de Cloudinary y BD |
| `PUT`    | `/pistas/:pistaId/fotos/:fotoId/portada`  | Sí                       | Sí                    | Define portada y sincroniza `imagenUrl` |
| `GET`    | `/sede/fotos`                             | **No**                   | No                    | Listado público de fotos de sede |
| `POST`   | `/sede/fotos`                             | Sí                       | Sí                    | Subida de foto de sede (máx 10) |
| `DELETE` | `/sede/fotos/:id`                         | Sí                       | Sí                    | Borrado de foto de sede |
| `GET`    | `/reservas`                               | Sí                       | No                    | Listado de reservas |
| `GET`    | `/reservas/:id`                           | Sí                       | No                    | Detalle de reserva |
| `POST`   | `/reservas`                               | Sí                       | No                    | Creación atómica de reserva |
| `PUT`    | `/reservas/:id`                           | Sí                       | No                    | Modificación de reserva |
| `DELETE` | `/reservas/:id`                           | Sí                       | No                    | Cancelación de reserva |
| `DELETE` | `/reservas`                               | Sí                       | Sí                    | Eliminación masiva |

## 🔐 Seguridad de Autenticación (OAuth 2.0 / OWASP)

La aplicación utiliza un esquema de tokens desacoplados para protegerse de vulnerabilidades XSS:

- **Access Token:** JWT de 15 minutos almacenado únicamente en la memoria de JavaScript (sin persistencia en `localStorage`).
- **Refresh Token:** Token de 7 días almacenado en una Cookie con flag `HttpOnly` y política `SameSite=Lax`.
- **Rotación y Detección de Reutilización:** Cada refresco emite un nuevo token e invalida el anterior. Si se detecta el uso de un token revocado, se revocan todas las sesiones activas del usuario.
- **Limpieza Automática (Spec 027):** Un job programado (`@Scheduled` a las 03:00 AM) purga de la base de datos todos los refresh tokens expirados protegiendo la ventana de 7 días para detección de reuso.

## ☁️ Almacenamiento de Medios (Cloudinary)

- Las imágenes de pistas, sede y avatares se suben a Cloudinary con optimización automática a formato WebP.
- Variables de entorno backend requeridas: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Se implementa borrado estricto en Cloudinary conforme a RGPD en cascada al eliminar fotos, usuarios o pistas.

## Notas funcionales

- La lectura de pistas (`GET /pistas`), fotos de pistas (`GET /pistas/:id/fotos`) y fotos de sede (`GET /sede/fotos`) es pública y accesible para cualquier usuario (con o sin sesión activa).
- El frontend envía `Authorization: Bearer <token>` en llamadas protegidas.
## 🚀 Despliegue en producción

### 🌐 Demo en vivo
- **Frontend (Netlify):** https://reserva-pistas-de-padel.netlify.app/
- **API Backend (Cloud Run):** `https://padel-backend-1058303442470.europe-west1.run.app`

La arquitectura de despliegue en la nube está diseñada para alta disponibilidad, bajo coste y mínimo consumo de memoria:

- **Frontend:** SPA alojada en **Netlify** con proxy inverso `/api/*` hacia Cloud Run para transporte *same-origin* de cookies `HttpOnly; Secure`.
- **Backend:** Contenedor Docker multi-etapa ejecutado en **Google Cloud Run** (perfil `prod` activado vía `SPRING_PROFILES_ACTIVE=prod`).
- **Base de Datos:** MySQL gestionado en **Aiven** con cifrado SSL obligatorio y pool de conexiones HikariCP optimizado (máx. 5 conexiones).
- **Medios:** Almacenamiento optimizado de imágenes en **Cloudinary**.

### Despliegue del Frontend en Netlify

1. Inicia sesión en [Netlify](https://app.netlify.com/) y selecciona **Add new site > Import an existing project**.
2. Conecta tu repositorio de GitHub `reserva-pistas-de-padel`.
3. Configura los parámetros del build:
   - **Base directory:** `padel-frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `padel-frontend/dist`
4. En `padel-frontend/netlify.toml`, asegúrate de sustituir `https://URL-DEL-BACKEND-EN-CLOUD-RUN.a.run.app` por la URL HTTPS asignada a tu servicio en Cloud Run.
5. Despliega el sitio. Netlify enrutará automáticamente todas las peticiones a `/api/*` hacia Cloud Run de forma transparente y servirá la SPA con fallback a `index.html`.

### Variables de entorno requeridas en Backend (Cloud Run)

| Variable | Descripción | Ejemplo / Formato |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Activa el perfil de producción | `prod` |
| `DB_URL` | Cadena JDBC de Aiven con SSL | `jdbc:mysql://<host>:<port>/padel_reservas?sslMode=REQUIRED&useSSL=true` |
| `DB_USERNAME` | Usuario de la base de datos | `avnadmin` |
| `DB_PASSWORD` | Contraseña de la base de datos | *(secreto en Cloud Secret Manager)* |
| `JWT_SECRET` | Clave simétrica HMAC-SHA256 en Base64 (32+ bytes) | *(generado con `openssl rand -base64 32`)* |
| `CLOUDINARY_CLOUD_NAME` | Identificador de Cloudinary | `tu-cloud-name` |
| `CLOUDINARY_API_KEY` | Clave pública de API Cloudinary | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Secreto de API Cloudinary | *(secreto en Cloud Secret Manager)* |
| `ADMIN_SEED_PASSWORD` | Contraseña del admin principal al primer arranque | *(secreto)* |
| `PORT` | Puerto HTTP (inyectado por Cloud Run) | `8081` |

### Construcción del Contenedor Docker

```bash
# Construir imagen Docker localmente
docker build -t padel-backend ./padel-backend

# Ejecutar imagen en local apuntando a perfil prod
docker run -p 8081:8081 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_URL="jdbc:mysql://host:3306/padel_reservas?useSSL=false" \
  -e DB_USERNAME="root" \
  -e DB_PASSWORD="password" \
  -e JWT_SECRET="dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=" \
  -e CLOUDINARY_CLOUD_NAME="demo" \
  -e CLOUDINARY_API_KEY="123" \
  -e CLOUDINARY_API_SECRET="abc" \
  padel-backend
```

---

## Propiedad intelectual

**Autor:** Alexander Ocampo Hernandez  
**Contacto público:** [linkedin.com/in/alexanderocampoh/](https://linkedin.com/in/alexanderocampoh/)  
**Repositorio original:** [github.com/alexoca1/reserva-pistas-de-padel](https://github.com/alexoca1/reserva-pistas-de-padel)  
**Año:** 2026  
**Licencia:** [Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

### Esta licencia permite:
- Ver, estudiar y evaluar el código fuente con fines educativos.
- Compartir el proyecto con atribución al autor original.
- Adaptar o derivar el proyecto bajo la misma licencia CC BY-NC-SA 4.0.

### Esta licencia prohíbe:
- El uso comercial del código sin autorización expresa del autor.
- Presentar este proyecto como propio en portafolios o procesos de selección sin atribución al autor original.
- Eliminar o modificar las cabeceras de copyright de los archivos.

### Licencia comercial
Para solicitar una licencia de uso comercial, contactar a través de LinkedIn:
[linkedin.com/in/alexanderocampoh/](https://linkedin.com/in/alexanderocampoh/)

---

## Aviso a reclutadores

Este proyecto es una **obra original** desarrollada por Alexander Ocampo Hernandez
como proyecto de portafolio para el **FP Superior de Desarrollo de Aplicaciones Web (DAW)**.

El código está disponible públicamente para **evaluación técnica**. Si desea utilizarlo,
referenciarlo o reproducirlo de cualquier forma, se requiere **atribución al autor original**
conforme a los términos de la licencia [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

