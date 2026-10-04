# Spec 034 — Accesibilidad Web: Atributos ALT Descriptivos en Imágenes

**Estado:** Implementada  
**Fecha:** 2026-10-03  
**Afecta:** Solo frontend (`padel-frontend`: `HomePage.tsx`, `PistasPage.tsx`, `InstalacionesPage.tsx`, `PerfilPage.tsx`, `DashboardPage.tsx`, `Avatar.tsx`, `LightboxGaleria.tsx`, `GaleriaSedeAdmin.tsx`, `Navbar.tsx`, `Layout.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`)

---

## Resumen

Esta especificación garantiza la accesibilidad web (WCAG 2.1 Criterio 1.1.1 Contenido no textual) y la optimización SEO en todas las imágenes del proyecto. Ningún elemento `<img>` debe quedar sin el atributo `alt` o con un valor vacío accidental. Se establecen reglas uniformes de autogeneración de texto alternativo contextualizado con el nombre de la entidad "Club Pádel Calatrava" y "Pádel Reservas".

---

## Escenarios

- **Como usuario con discapacidad visual que utiliza lector de pantalla (NVDA, JAWS, VoiceOver)**, al navegar por las galerías, pistas, perfil o inicio, escucho descripciones claras del contenido de cada imagen (número de pista, instalación, perfil o propósito del logo).
- **Como usuario con conexión lenta o cuando una imagen no carga**, el navegador muestra un texto alternativo representativo y significativo que permite entender el contenido de la interfaz.
- **Como motor de búsqueda (Google Imágenes)**, indexo correctamente el contexto de las imágenes vinculadas a las instalaciones del club.

---

## Requisitos funcionales

### RF-01 — Fotos de pista (`FotoPista`)
- En galerías de pistas y miniaturas de gestión:
  `alt={`Foto ${index + 1} de la pista ${pista.numeroPista} — Club Pádel Calatrava`}`
  donde `index` es el índice base 0 convertido a base 1 (`index + 1`).

### RF-02 — Portadas de pista (`pista.imagenUrl`)
- En tarjetas de pistas (móvil) y tabla de pistas (escritorio) en `PistasPage` e `InstalacionesPage`:
  `alt={`Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`}`

### RF-03 — Fotos de sede (`FotoSede`)
- En la galería pública de `InstalacionesPage` y panel admin `GaleriaSedeAdmin`:
  `alt={`Instalación ${index + 1} del Club Pádel Calatrava`}`
- En previsualización de subida en `GaleriaSedeAdmin`:
  `alt="Vista previa de foto de la sede — Club Pádel Calatrava"`

### RF-04 — Avatar de usuario (`Avatar.tsx`)
- Si dispone de `url` (`avatarUrl`):
  `alt={`Foto de perfil de ${nombreCompleto || nombre || "usuario"}`}`
- Si muestra iniciales (etiqueta `<span>` o `<div>`, no `<img>`):
  Añadir `role="img"` y `aria-label={`Avatar de ${nombreCompleto || nombre || "usuario"}`}` para asegurar lectura accesible.

### RF-05 — Imagen principal Hero (`HomePage.tsx`)
- Para `padel-hero-image.png`:
  `alt="Pistas de pádel iluminadas en interior — Club Pádel Calatrava"`

### RF-06 — Galería a pantalla completa (`LightboxGaleria.tsx`)
- Heredar el `alt` descriptivo de la imagen que se visualiza mediante la prop o campo `alt`:
  `alt={fotos[indice]?.alt || `Foto ${indice + 1} de ${fotos.length} — Club Pádel Calatrava`}`

### RF-07 — Logos y favicon de la marca
- En `Navbar.tsx`, `Layout.tsx`, `LoginPage.tsx` y `RegisterPage.tsx`:
  `alt="Logo Pádel Reservas"`

### RF-08 — Validación estricta
- Ninguna etiqueta `<img>` debe carecer del atributo `alt`.
- `document.querySelectorAll('img:not([alt])').length === 0` en todas las páginas.
- No deben existir `alt=""` salvo que se trate de elementos decorativos explícitos con `role="presentation"`.

---

## Fuera de alcance
- Modificaciones en base de datos o backend.
- Carga de textos alternativos editables por el usuario en formularios (se autogeneran sistemáticamente a partir del modelo).
