# Padel Reservas - Backend + Frontend

Aplicación completa para la gestión de reservas de pistas de pádel.

El sistema está compuesto por dos partes:

- Backend con Spring Boot (API REST, JWT, MySQL).
- Frontend con React + Vite (interfaz de usuario).

## Descripción del proyecto

La aplicación permite:

- Registro e inicio de sesión de usuarios.
- Gestión de perfil autenticado.
- Consulta de pistas de pádel disponibles.
- Creación, edición y eliminación de reservas.
- Control por roles (`ROLE_ADMIN` y `ROLE_USER`) para proteger operaciones sensibles.

Puertos y base de datos del entorno local:

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- MySQL: `localhost:3306`
- Base de datos: `padel_reservas`

## Tecnologías usadas

- Java + Spring Boot
- Spring Security + JWT
- MySQL
- React
- Vite
- Tailwind CSS
- shadcn/ui

## Requisitos previos

- Java 17 o superior
- Maven 3.9 o superior
- MySQL 8+
- Node.js 18+ (recomendado 20 LTS)
- npm 9+
- Git

## Instalación y ejecución

## 1) Backend (Spring Boot)

1. Clona o abre el proyecto backend en tu máquina.
2. Crea la base de datos en MySQL:

```sql
CREATE DATABASE padel_reservas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Configura `application.properties` (o `application.yml`) con tu conexión local:

```properties
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/padel_reservas?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

4. Ejecuta la aplicación backend:

```bash
mvn spring-boot:run
```

5. Verifica que está arriba en:

```text
http://localhost:8080
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
VITE_API_URL=http://localhost:8080
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

Estructura recomendada/esperada:

```text
padel-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── ...
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       ├── model/
│   │   │       ├── dto/
│   │   │       └── security/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── ...
│   └── test/
├── pom.xml
└── README.md
```

## Frontend (React + Vite)

Estructura actual del proyecto:

```text
padel-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── PistasPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ReservasPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Endpoints principales de la API

Nota de migración de nombres:

- Lo que antes se llamaba `aulas` ahora es `/pistas`.
- Lo que antes se llamaba `centros` ahora es `/reservas`.

| Método   | Ruta             | ¿Requiere autenticación? | ¿Requiere ROLE_ADMIN? |
| -------- | ---------------- | ------------------------ | --------------------- |
| `POST`   | `/auth/login`    | No                       | No                    |
| `POST`   | `/auth/register` | No                       | No                    |
| `GET`    | `/auth/perfil`   | Sí                       | No                    |
| `GET`    | `/pistas`        | Sí                       | No                    |
| `GET`    | `/pistas/:id`    | Sí                       | No                    |
| `POST`   | `/pistas`        | Sí                       | Sí                    |
| `PUT`    | `/pistas/:id`    | Sí                       | Sí                    |
| `DELETE` | `/pistas/:id`    | Sí                       | Sí                    |
| `GET`    | `/reservas`      | Sí                       | No                    |
| `GET`    | `/reservas/:id`  | Sí                       | No                    |
| `POST`   | `/reservas`      | Sí                       | No                    |
| `PUT`    | `/reservas/:id`  | Sí                       | No                    |
| `DELETE` | `/reservas/:id`  | Sí                       | No                    |

## Notas funcionales

- El token JWT se guarda en `localStorage` con la clave `authToken`.
- El frontend envía `Authorization: Bearer <token>` en llamadas protegidas.
- En `pistas`, crear/editar/eliminar está restringido a `ROLE_ADMIN`.
- En `reservas`, el frontend permite editar/eliminar solo si el usuario es admin o propietario.
