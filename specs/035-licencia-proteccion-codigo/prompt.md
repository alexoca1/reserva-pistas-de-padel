# Prompt de implementación — Spec 035: Licencia y Protección del Código

Implementa la spec 035 siguiendo `spec.md`, `plan.md` y `tasks.md`.

## Contexto del proyecto
- Autor: Alexander Ocampo Hernandez
- LinkedIn: https://linkedin.com/in/alexanderocampoh/
- Repositorio: https://github.com/alexoca1/reserva-pistas-de-padel
- Año: 2026
- Licencia: CC BY-NC-SA 4.0

---

## T01 — `LICENSE` en la raíz del repositorio

Crear el archivo `LICENSE` con el siguiente contenido exacto (el texto canónico
en inglés es necesario para que GitHub lo detecte automáticamente):

```
Copyright (c) 2026 Alexander Ocampo Hernandez

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International

...texto legal completo de CC BY-NC-SA 4.0...
```

Añadir al final del archivo, DESPUÉS del texto legal completo, la siguiente nota:

```
---
NOTE ON AI-GENERATED IMAGES

Some images included in this project (og-image.png, padel-hero-image.webp, hero.webp)
were generated with artificial intelligence tools. Under Article 5.1 of the Spanish
Intellectual Property Act (LPI), works generated entirely by AI without direct human
creative authorship are not protected by copyright. These images are therefore NOT
covered by this license and are provided as-is for demonstration purposes only.
```

---

## T02 — `README.md` en la raíz

### 2a — Badge de licencia
Añadir justo después de la línea `# Padel Reservas - Backend + Frontend` (línea 1):

```markdown
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
```

### 2b — Secciones al final del README
Añadir al final del archivo (después de la última línea de contenido actual):

```markdown
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
```

---

## T03 — `padel-frontend/README.md`

Añadir las siguientes líneas al INICIO del archivo, antes de `# Padel Reservas - Frontend`:

```markdown
<!--
  Copyright (c) 2026 Alexander Ocampo Hernandez
  Licencia: CC BY-NC-SA 4.0 — ver LICENSE en la raíz del repositorio
  Repositorio: https://github.com/alexoca1/reserva-pistas-de-padel
-->

```

---

## T04 — `.github/CODEOWNERS`

Crear el archivo `.github/CODEOWNERS` con el siguiente contenido exacto:

```
# Propietario del repositorio: Alexander Ocampo Hernandez
# https://github.com/alexoca1/reserva-pistas-de-padel
* @alexoca1
```

---

## T05 — Cabeceras de copyright en Java (backend)

Añadir el siguiente bloque de comentario al inicio de cada archivo, ANTES de la línea `package`:

```java
/*
 * Reserva de Pistas de Pádel — Club Pádel Calatrava
 * Copyright (c) 2026 Alexander Ocampo Hernandez
 * Licencia: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 *           https://creativecommons.org/licenses/by-nc-sa/4.0/
 * Repositorio: https://github.com/alexoca1/reserva-pistas-de-padel
 */
```

Archivos afectados:
1. `padel-backend/src/main/java/com/padel/reservas/PadelReservasApplication.java`
2. `padel-backend/src/main/java/com/padel/reservas/config/SecurityConfig.java`
3. `padel-backend/src/main/java/com/padel/reservas/config/RateLimitFilter.java`

---

## T06 — Cabeceras de copyright en TypeScript (frontend)

Añadir el siguiente bloque de comentario al inicio de cada archivo, ANTES del primer `import`:

```typescript
/*
 * Reserva de Pistas de Pádel — Club Pádel Calatrava
 * Copyright (c) 2026 Alexander Ocampo Hernandez
 * Licencia: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 *           https://creativecommons.org/licenses/by-nc-sa/4.0/
 * Repositorio: https://github.com/alexoca1/reserva-pistas-de-padel
 */
```

Archivos afectados:
1. `padel-frontend/src/main.tsx`
2. `padel-frontend/src/App.tsx`

---

## T07 — `ARCHITECTURE.md`

Añadir al final del archivo la siguiente sección:

```markdown
---

## Licencia

Este proyecto está protegido bajo la licencia
**[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)**.

Ver el archivo [`LICENSE`](./LICENSE) en la raíz del repositorio para el texto legal completo.

**Copyright (c) 2026 Alexander Ocampo Hernandez**
```

---

## T08 — `AGENTS.md` de backend y frontend

### Backend: `padel-backend/AGENTS.md`
En la sección `## Descripción del Proyecto`, añadir después de la lista de puertos:

```markdown
- **Licencia:** [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) · Copyright (c) 2026 Alexander Ocampo Hernandez
- **Repositorio:** https://github.com/alexoca1/reserva-pistas-de-padel
```

### Frontend: `padel-frontend/AGENTS.md`
En la sección que contiene los puertos Frontend/Backend/Autenticación, añadir:

```markdown
- **Licencia:** [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) · Copyright (c) 2026 Alexander Ocampo Hernandez
- **Repositorio:** https://github.com/alexoca1/reserva-pistas-de-padel
```

---

## Verificación final

Ejecutar desde la raíz del repositorio:

```bash
git diff --stat
```

El diff debe mostrar ÚNICAMENTE:
- `LICENSE` (nuevo)
- `README.md`
- `ARCHITECTURE.md`
- `.github/CODEOWNERS` (nuevo)
- `padel-backend/AGENTS.md`
- `padel-backend/src/main/java/com/padel/reservas/PadelReservasApplication.java`
- `padel-backend/src/main/java/com/padel/reservas/config/SecurityConfig.java`
- `padel-backend/src/main/java/com/padel/reservas/config/RateLimitFilter.java`
- `padel-frontend/README.md`
- `padel-frontend/AGENTS.md`
- `padel-frontend/src/App.tsx`
- `padel-frontend/src/main.tsx`
- `specs/035-licencia-proteccion-codigo/` (todos los archivos nuevos)

No debe aparecer ningún `.java` fuera de los 3 de T05 ni ningún `.tsx/.ts` fuera de los 2 de T06.
