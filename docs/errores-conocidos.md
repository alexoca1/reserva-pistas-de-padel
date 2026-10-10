# Base de Conocimiento de Errores Conocidos y Soluciones

Este documento constituye la **fuente primaria de memoria técnica y depuración** para el proyecto *Reserva Pistas de Pádel*.

> [!IMPORTANT]
> **Protocolo obligatorio para agentes e IA:**
> 1. **Consultar primero:** Antes de iniciar cualquier tarea de depuración o diagnóstico de un bug, revisa este documento para comprobar si el error y su solución ya están documentados.
> 2. **Registrar al resolver:** Cada vez que se resuelva un error no trivial o recurrente, debe añadirse una nueva entrada siguiendo la plantilla estándar.
> 3. **Mantener integridad:** Respetar los IDs estructurados (`ERR-<CATEGORÍA>-<NUM>`) y categorizar adecuadamente.

---

## Tabla de Contenidos

- [Taxonomía y Convenciones de Identificadores](#taxonomía-y-convenciones-de-identificadores)
- [Plantilla Estándar para Nuevos Errores](#plantilla-estándar-para-nuevos-errores)
- [1. Backend y Seguridad [BE]](#1-backend-y-seguridad-be)
  - [ERR-BE-001: Error 401 (Unauthorized) por desajuste de algoritmo JWT (HS384 vs HS256)](#err-be-001-error-401-unauthorized-por-desajuste-de-algoritmo-jwt-hs384-vs-hs256)
  - [ERR-BE-002: Fallo en arranque de Spring Boot por variables de entorno faltantes (Cloudinary)](#err-be-002-fallo-en-arranque-de-spring-boot-por-variables-de-entorno-faltantes-cloudinary)

---

## Taxonomía y Convenciones de Identificadores

Los errores se clasifican con el prefijo `ERR-`, seguido de la categoría y un secuencial de tres dígitos:

| Prefijo | Categoría | Alcance |
| :--- | :--- | :--- |
| `ERR-BE-` | **Backend & Seguridad** | Spring Boot, Spring Security, JWT, Filtros, Controladores, Servicios |
| `ERR-FE-` | **Frontend & Reactividad** | React, Vite, Tailwind CSS, API Client, AuthContext |
| `ERR-DB-` | **Base de Datos** | PostgreSQL/MySQL, JPA/Hibernate, scripts SQL, migraciones |
| `ERR-ENV-` | **Entorno & Herramientas** | Maven, npm, scripts, variables de entorno, Docker |

**Niveles de Severidad:**
- 🔴 **Crítica**: Bloquea ejecución general, caída del sistema o fallo crítico de autenticación.
- 🟠 **Alta**: Característica clave rota o inaccesible (ej. fallo en peticiones API o CORS).
- 🟡 **Media**: Comportamiento anómalo, renderizado incorrecto o degradación funcional.
- 🟢 **Baja**: Advertencia, inconsistencia menor o inconveniente de tooling/entorno.

---

## Plantilla Estándar para Nuevos Errores

*(Copiar y pegar este bloque al registrar una nueva solución)*

```markdown
### ERR-[CAT]-[NUM]: [Título descriptivo y conciso del problema]

- **Severidad:** 🔴 Crítica | 🟠 Alta | 🟡 Media | 🟢 Baja
- **Componentes:** `[Ruta del archivo o módulo afectado, ej: padel-backend/src/.../SecurityConfig.java]`
- **Síntoma / Mensaje de Error:**
  `\``text
  [Pegar aquí el mensaje exacto de la consola, terminal, traza o descripción visual del fallo]
  `\``
- **Contexto:**
  [Describir en qué flujo o acción ocurre el problema]
- **Causa Raíz:**
  [Explicación técnica clara del motivo por el cual ocurría el error]
- **Solución Aplicada:**
  [Pasos detallados de la solución y fragmentos de código correctos vs. incorrectos]
  `\``language
  // Código de ejemplo o corrección
  `\``
- **Prevención / Regla a Recordar:**
  [Directriz o regla preventiva para evitar que el fallo vuelva a reproducirse]
```

---

## 1. Backend y Seguridad [BE]

### ERR-BE-001: Error 401 (Unauthorized) por desajuste de algoritmo JWT (HS384 vs HS256)

- **Severidad:** 🔴 Crítica
- **Componentes:** `padel-backend/src/main/java/com/padel/reservas/services/JwtService.java`, `padel-backend/src/main/java/com/padel/reservas/config/SecurityConfig.java`
- **Síntoma / Mensaje de Error:**
  ```text
  Error: 401
  El frontend falla al cargar datos protegidos (como `/reservas`) y redirige o muestra un error de autorización.
  NimbusJwtDecoder rechaza el token con error de firma o algoritmo inválido.
  ```
- **Contexto:** Autenticación de usuarios y consumo de endpoints protegidos desde el frontend tras un inicio de sesión aparentemente exitoso.
- **Causa Raíz:** La librería JJWT infiere por defecto el algoritmo `HS384` si la clave secreta (`SECRET_KEY`) supera cierta longitud. Sin embargo, en `SecurityConfig`, el `NimbusJwtDecoder` estaba esperando y validando específicamente firmas con `HS256`. Este desajuste provocaba que los tokens emitidos fueran rechazados inmediatamente al intentar validarlos en rutas protegidas.
- **Solución Aplicada:**
  Forzar explícitamente el uso del algoritmo `HS256` tanto en la generación del token (`JwtService`) como en su decodificación (`SecurityConfig`).
  ```java
  // En JwtService.java:
  Jwts.builder()
      .signWith(getSignInKey(), Jwts.SIG.HS256) // Se fuerza HS256

  // En SecurityConfig.java:
  NimbusJwtDecoder.withSecretKey(secretKey)
      .macAlgorithm(MacAlgorithm.HS256) // Se verifica HS256
      .build();
  ```
- **Prevención / Regla a Recordar:** Siempre especificar explícitamente el algoritmo de firma (`Jwts.SIG.HS256`) al construir el JWT y asegurarse de que coincide exactamente con la configuración del decodificador (`MacAlgorithm.HS256`) de Spring Security.

---

### ERR-BE-002: Fallo en arranque de Spring Boot por variables de entorno faltantes (Cloudinary)

- **Severidad:** 🔴 Crítica
- **Componentes:** `padel-backend/src/main/resources/application.properties`
- **Síntoma / Mensaje de Error:**
  ```text
  java.lang.IllegalArgumentException: Could not resolve placeholder 'CLOUDINARY_CLOUD_NAME' in value "${CLOUDINARY_CLOUD_NAME}"
  Application run failed
  ```
- **Contexto:** Arranque del servidor Spring Boot en entorno de desarrollo local o CI/CD.
- **Causa Raíz:** Spring Boot falla al iniciar el contexto de la aplicación (`ApplicationContext`) si existen propiedades inyectadas (`@Value` o referencias en `application.properties`) que no pueden ser resueltas y carecen de un valor por defecto.
- **Solución Aplicada:**
  Configurar valores de fallback (por defecto) en `application.properties` usando la sintaxis `${VARIABLE:valor_defecto}` para las credenciales externas.
  ```properties
  cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME:demo_cloud}
  cloudinary.api-key=${CLOUDINARY_API_KEY:demo_key}
  cloudinary.api-secret=${CLOUDINARY_API_SECRET:demo_secret}
  ```
- **Prevención / Regla a Recordar:** Todas las variables de entorno inyectadas para servicios de terceros (Cloudinary, SendGrid, etc.) deben contar con un valor de fallback en desarrollo local para evitar que la falta de credenciales bloquee el arranque completo de la aplicación.
