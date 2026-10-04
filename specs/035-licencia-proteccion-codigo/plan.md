# Plan técnico: Spec 035 — Licencia y Protección del Código: CC BY-NC-SA 4.0

**Spec relacionada:** `../spec.md`

---

## Diseño técnico

### 1. Elección de licencia (RF-01)
Se usa **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International** (CC BY-NC-SA 4.0) porque:
- Es reconocida por GitHub (detección automática del texto canónico en inglés).
- Permite el uso educativo y la evaluación técnica por reclutadores.
- Prohíbe el uso comercial sin autorización expresa.
- La cláusula ShareAlike garantiza que derivados mantengan las mismas condiciones.

El texto del LICENSE va en inglés (canónico oficial), aunque la documentación del README puede explicar las condiciones en español. La nota sobre imágenes IA aclara la situación legal conforme al Art. 5.1 LPI española.

### 2. Actualización de README.md (RF-02)
- El badge se añade justo debajo del `<h1>` (título del proyecto) usando la sintaxis Shields.io oficial de CC.
- Las dos secciones nuevas (`## Propiedad intelectual` y `## Aviso a reclutadores`) se añaden **al final del README** para no alterar la lectura del documento técnico actual ni obligar a desplazarse para ver el contenido de instalación.
- No se elimina ni modifica ningún contenido existente.

### 3. Cabeceras de copyright (RF-05, RF-06)
- Se insertan **al inicio del archivo, antes del `package` declaration** en Java, y **antes del primer `import`** en TypeScript/TSX.
- Formato Java: bloque `/* ... */` multilínea (compatible con todos los linters Java).
- Formato TypeScript: bloque `/* ... */` multilínea (mismo formato, compatible con ESLint/TSC).
- Solo 5 archivos reciben cabecera: los 3 de backend más estratégicos (punto de entrada + configuración de seguridad + filtro de rate limit) y los 2 puntos de entrada del frontend.

### 4. CODEOWNERS (RF-04)
- GitHub usa `.github/CODEOWNERS` para requerir revisión del propietario en PRs.
- Una única línea `* @alexoca1` cubre todo el repositorio sin excepciones.

### 5. ARCHITECTURE.md y AGENTS.md (RF-07, RF-08)
- `ARCHITECTURE.md`: se añade la sección `## Licencia` al final del archivo (mínimo texto, máximo claridad).
- `padel-backend/AGENTS.md` y `padel-frontend/AGENTS.md`: se añade una línea de licencia y URL del repositorio en la sección de información general ya existente en cada uno, manteniendo el formato de lista de viñetas ya presente.

---

## Decisiones y alternativas descartadas

1. **¿Usar MIT en lugar de CC BY-NC-SA 4.0?**
   - *Decisión:* Descartado. MIT permite el uso comercial sin restricciones. CC BY-NC-SA 4.0 es más adecuado para portafolios donde el autor quiere permitir evaluación técnica pero reservar derechos comerciales.

2. **¿Añadir cabecera a TODOS los archivos `.java` y `.tsx`?**
   - *Decisión:* Descartado. Un diff masivo en un proyecto activo no aporta valor proporcional al ruido que genera. La cabecera en los archivos estratégicos (punto de entrada y seguridad) es suficiente para establecer autoría; el `LICENSE` en la raíz cubre todo el repositorio legalmente.

3. **¿Usar `SPDX-License-Identifier` en las cabeceras en lugar de texto libre?**
   - *Decisión:* Descartado por simplicidad. El identificador SPDX es más compacto (`SPDX-License-Identifier: CC-BY-NC-SA-4.0`), pero el texto libre es más legible para un reclutador o evaluador que no conozca SPDX.

4. **¿Texto del LICENSE en español?**
   - *Decisión:* Descartado. GitHub detecta la licencia comparando el texto con el canónico oficial en inglés. Usar la versión en español impediría la detección automática.

---

## Impacto en seguridad
- Ninguno. Los cambios son puramente documentales y de metadatos de licencia.

## Impacto en tests
- Ninguno. No se modifica lógica de negocio ni interfaces. Los archivos `.java` afectados solo reciben un bloque de comentario antes del `package`.
