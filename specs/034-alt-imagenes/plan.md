# Plan técnico: Spec 034 — Accesibilidad Web: Atributos ALT Descriptivos en Imágenes

**Spec relacionada:** `../spec.md`

---

## Diseño técnico

### 1. Archivos afectados y modificaciones
| Archivo | Tipo de imagen | Nuevo atributo ALT |
|---|---|---|
| `src/pages/HomePage.tsx` | Hero image | `"Pistas de pádel iluminadas en interior — Club Pádel Calatrava"` |
| `src/pages/PistasPage.tsx` | Portadas de pista (móvil y tabla) | `` `Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava` `` |
| `src/pages/PistasPage.tsx` | Galería modal admin (`FotoPista`) | `` `Foto ${index + 1} de la pista ${pistaEditando.numeroPista} — Club Pádel Calatrava` `` |
| `src/pages/PistasPage.tsx` | Datos hacia Lightbox | Pasar propiedad `alt` personalizada por foto |
| `src/pages/InstalacionesPage.tsx` | Fotos de sede (`FotoSede`) | `` `Instalación ${index + 1} del Club Pádel Calatrava` `` |
| `src/pages/InstalacionesPage.tsx` | Miniaturas de pistas | `` `Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava` `` |
| `src/components/GaleriaSedeAdmin.tsx` | Fotos de sede y preview | `` `Instalación ${index + 1} del Club Pádel Calatrava` `` |
| `src/components/Avatar.tsx` | Avatar con URL o iniciales | `` `Foto de perfil de ${nombre}` `` / `aria-label` |
| `src/components/LightboxGaleria.tsx` | Visor modal | Soporte para `alt?: string` en `FotoLightbox` y herencia en `<img>` |
| `src/components/Navbar.tsx` | Logo favicon | `"Logo Pádel Reservas"` |
| `src/components/Layout.tsx` | Logo footer | `"Logo Pádel Reservas"` |
| `src/pages/LoginPage.tsx` | Logo card | `"Logo Pádel Reservas"` |
| `src/pages/RegisterPage.tsx` | Logo card | `"Logo Pádel Reservas"` |

### 2. Decisiones y alternativas descartadas
- **¿Guardar `altText` en backend/base de datos?**
  - *Decisión:* Descartado.
  - *Motivo:* Filosofía Ponytail (Artículo 1 Constitución). Autogenerar el `alt` contextual en el cliente ahorra migraciones de base de datos, DTOs y endpoints para un resultado semántico idéntico y consistente.

---

## Impacto en accesibilidad y SEO
- Cumplimiento estricto con WCAG 2.1 Criterio 1.1.1 (Nivel A).
- Eliminación de avisos de accesibilidad de lectores de pantalla ("imagen sin etiqueta").
