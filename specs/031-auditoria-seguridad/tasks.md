# Tasks 031 — Auditoría de Seguridad

## PARTE A — Dependencias vulnerables (OWASP Dependency Check)

### A1 — Añadir plugin OWASP en pom.xml
- **Estado:** ✅ Completado
- Plugin `dependency-check-maven:9.0.9` añadido en `<build><plugins>` de `padel-backend/pom.xml`.

### A2 — Ejecutar `mvn dependency-check:check`
- **Estado:** ⚠️ Fallido — sin datos NVD disponibles
- Comando ejecutado: `.\mvnw.cmd dependency-check:check`
- **Causa del fallo:** La NVD (National Vulnerability Database) devolvió un error `403/404`
  al intentar descargar la base de datos de CVEs. Esto ocurre porque la NVD requiere
  una API key para acceso programático desde versión 9.x del plugin.
- **Error exacto:**
  ```
  UpdateException: Error updating the NVD Data; the NVD returned a 403 or 404 error
  NoDataException: No documents exist
  ```

### A3 — Resultados OWASP
- **Dependencias analizadas:** No completado (sin base de datos NVD disponible)
- **CVEs encontrados:** No determinado
- **Informe HTML:** No generado
- **Solución recomendada:** Obtener una NVD API Key gratuita en
  https://nvd.nist.gov/developers/request-an-api-key y configurarla:
  ```xml
  <plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>9.0.9</version>
    <configuration>
      <nvdApiKey>${env.NVD_API_KEY}</nvdApiKey>
    </configuration>
  </plugin>
  ```
  O ejecutar con: `.\mvnw.cmd dependency-check:check -DnvdApiKey=TU_KEY`

---

## PARTE B — Secretos en historial Git

### B1 — Búsqueda de passwords en historial
- **Estado:** ✅ Completado
- **Output:**
  ```
  this.adminSeedPassword = adminSeedPassword;
  MVNW_USERNAME='' MVNW_PASSWORD='' ;;
  has-password) [ -n "${MVNW_USERNAME-}" ] || MVNW_USERNAME='' MVNW_PASSWORD='' ;;
  @SET MVNW_PASSWORD=
  ```
- **Análisis:** ✅ **Sin riesgo.** Todos los matches son:
  - `adminSeedPassword` — variable Java del seed de datos (coge el valor de env variable).
  - `MVNW_PASSWORD` — placeholders vacíos del wrapper Maven (`mvnw`, `mvnw.cmd`), sin valor real.
  - No hay contraseñas en texto plano en el historial.

### B2 — Búsqueda de API keys / secrets en historial
- **Estado:** ✅ Completado
- **Output relevante:**
  ```
  +cloudinary.api-key=${CLOUDINARY_API_KEY}
  +cloudinary.api-secret=${CLOUDINARY_API_SECRET}
  +jwt.secret=${JWT_SECRET:REMOVED_DEVELOPMENT_JWT_SECRET}
  ```
  (resto son variables `token` de código Java/TypeScript — no credenciales)
- **Análisis:**
  - `cloudinary.api-key` y `cloudinary.api-secret` usan **variables de entorno** — ✅ correcto.
  - `jwt.secret` tiene un valor por defecto en Base64 (`dGVzdC1zZWNyZXQta2V5...`)
    que corresponde a `test-secret-key-for-development-123456789012345456` — es un
    valor de desarrollo. En producción debe sobreescribirse con `JWT_SECRET` real en `.env`.
  - ⚠️ **Recomendación:** Asegurarse de que `.env` está en `.gitignore` y que el
    fallback de JWT_SECRET no sea predecible en producción.

### B3 — Historial de application.properties
- **Estado:** ✅ Completado
- **Commits que tocaron el fichero (9 commits, desde el inicial):**
  ```
  7c11002  agregada opción de editar perfiles y mejoras en los dashboards (Sep 28)
  6023d2f  Mejora de tablas de reservas (Sep 18)
  2df35f6  segundo diseño frontend (Sep 4)
  b975cdf  commit 4 agregamos cambios nombres y carpetas (Aug 31)
  15be251  Agent host session 8f080cd4 - turn 2 start (Aug 27)
  cd0a716  Agent Host changes for agents/rename-backend-to-padel-backend (Aug 27)
  c63439e  Agent host session 8f080cd4 - turn 1 (Aug 26)
  9782e4d  Agent host session 8f080cd4 - baseline checkpoint (Aug 26)
  d8015db  primer commit (Apr 20)
  ```
- **Contenido del primer commit (más antiguo):**
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/padel_reservas
  spring.datasource.username=root
  spring.datasource.password=
  ```
- **Análisis:** ✅ **Sin riesgo.** La contraseña de BD en el primer commit era
  **vacía** (`password=`). Los commits posteriores migraron a variables de entorno
  (`${DB_PASSWORD}`). No hay credenciales reales comprometidas en el historial.

---

## Resumen de riesgos

| # | Descripción | Severidad | Estado |
|---|---|---|---|
| R1 | OWASP sin API key NVD — no se pudo ejecutar el análisis | Media | ⚠️ Pendiente de key |
| R2 | `jwt.secret` tiene fallback hardcoded en Base64 en application.properties | Baja | ✅ Solo desarrollo |
| R3 | Credenciales de BD en el primer commit (vacías) | Ninguna | ✅ Sin riesgo |
| R4 | Cloudinary keys en historial | Ninguna | ✅ Usando env variables |

## Acciones pendientes

- [ ] Solicitar NVD API Key gratuita en https://nvd.nist.gov/developers/request-an-api-key
      y reejecutar el análisis OWASP.
- [ ] Verificar que el valor por defecto de `JWT_SECRET` se sobreescribe en todos
      los entornos que no sean desarrollo local.
