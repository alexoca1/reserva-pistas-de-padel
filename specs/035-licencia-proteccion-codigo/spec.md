# Spec 035 — Licencia y Protección del Código: CC BY-NC-SA 4.0

**Estado:** Completado  
**Fecha:** 2026-10-03  
**Afecta:** Raíz del repositorio (`LICENSE`, `README.md`, `ARCHITECTURE.md`, `.github/CODEOWNERS`), `padel-backend` (3 archivos `.java` de entrada/seguridad, `AGENTS.md`), `padel-frontend` (`src/main.tsx`, `src/App.tsx`, `README.md`, `AGENTS.md`)

---

## Resumen

Esta especificación establece la protección formal de la propiedad intelectual del proyecto **reserva-pistas-de-padel**, desarrollado por Alexander Ocampo Hernandez como proyecto de portafolio para el FP Superior DAW.

La estrategia combina:
1. Licencia legal estándar **CC BY-NC-SA 4.0** en el archivo `LICENSE` de la raíz.
2. Documentación pública de autoría y condiciones de uso en `README.md`.
3. Cabeceras de copyright en archivos clave de backend y frontend (puntos de entrada y seguridad únicamente, sin diff masivo).
4. Declaración de propiedad del repositorio en `.github/CODEOWNERS`.
5. Referencias de licencia en `ARCHITECTURE.md` y los `AGENTS.md` de cada capa.

**No se toca ningún archivo de lógica de aplicación** fuera de los enumerados explícitamente en las tareas T05 y T06.

---

## Escenarios

- **Como reclutador técnico** que descubre el repositorio en GitHub, veo el badge de licencia junto al título del README, una sección clara de autoría y condiciones de uso, y el texto legal completo en `LICENSE`.
- **Como desarrollador externo** que quiere estudiar el código, sé que puedo hacerlo con fines educativos y compartirlo con atribución, pero no puedo usarlo comercialmente sin autorización expresa.
- **Como auditor de propiedad intelectual**, verifico que GitHub detecta automáticamente la licencia CC BY-NC-SA 4.0 desde el archivo `LICENSE` y que las cabeceras de copyright están presentes en los archivos estratégicos.

---

## Requisitos funcionales

### RF-01 — Archivo `LICENSE` en la raíz
- Texto completo de la licencia **Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional** en inglés (texto oficial canónico detectado por GitHub).
- Primera línea: `Copyright (c) 2026 Alexander Ocampo Hernandez`.
- Nota aclaratoria: las imágenes generadas con IA incluidas en el proyecto no están cubiertas por derechos de autor según el Art. 5.1 LPI española.

### RF-02 — `README.md` en la raíz
- Badge de licencia CC BY-NC-SA 4.0 visible junto al título.
- Sección `## Propiedad intelectual` con: autor, LinkedIn, repositorio original, año, qué permite la licencia, qué prohíbe, y cómo solicitar licencia comercial.
- Sección `## Aviso a reclutadores` que identifique el proyecto como obra original para el FP DAW, disponible para evaluación técnica con atribución obligatoria.

### RF-03 — `padel-frontend/README.md`
- Línea de copyright y referencia a la licencia al inicio del archivo, sin alterar el resto.

### RF-04 — `.github/CODEOWNERS`
- Archivo con una única regla: `* @alexoca1`.

### RF-05 — Cabeceras de copyright en backend (3 archivos)
- `PadelReservasApplication.java`, `SecurityConfig.java`, `RateLimitFilter.java`.
- Bloque de comentario Java con: nombre del proyecto, copyright con autor y año, licencia CC BY-NC-SA 4.0 con URL, y URL del repositorio.

### RF-06 — Cabeceras de copyright en frontend (2 archivos)
- `src/main.tsx`, `src/App.tsx`.
- Comentario TypeScript equivalente al de backend.

### RF-07 — `ARCHITECTURE.md`
- Sección `## Licencia` al final con referencia a CC BY-NC-SA 4.0 y puntero al archivo `LICENSE`.

### RF-08 — `AGENTS.md` de backend y frontend
- Línea de licencia y URL del repositorio en la sección de información general de cada uno.

---

## Fuera de alcance

- No se añaden cabeceras a archivos de test, configuración (`.json`, `.properties`, `.xml`) ni archivos generados.
- No se toca la constitución del proyecto ni specs anteriores.
- No se modifica ningún archivo de lógica de aplicación fuera de los listados en RF-05 y RF-06.
- Las imágenes generadas con IA del proyecto quedan excluidas de la cobertura del LICENSE según la nota aclaratoria de RF-01.

---

## Verificación de cierre

- `LICENSE` detectado por GitHub como CC BY-NC-SA 4.0.
- Badge de licencia se renderiza en el README del repositorio.
- `git diff --stat` muestra exclusivamente los archivos de T01–T08.
