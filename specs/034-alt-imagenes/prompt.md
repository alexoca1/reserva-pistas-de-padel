# Prompt de implementación — Spec 034: Atributos ALT Descriptivos en Imágenes

Implementa la spec 034 siguiendo `spec.md`, `plan.md` y `tasks.md`.

## Reglas por tipo de imagen:
1. Fotos de pista (`FotoPista`):
   `alt={`Foto ${index + 1} de la pista ${pista.numeroPista} — Club Pádel Calatrava`}`
2. Imagen de portada de pista (`pista.imagenUrl`):
   `alt={`Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`}`
3. Fotos de sede (`FotoSede`):
   `alt={`Instalación ${index + 1} del Club Pádel Calatrava`}`
4. Avatar de usuario (`Avatar.tsx`):
   - Con foto: `alt={`Foto de perfil de ${nombre}`}`
   - Con iniciales: añadir `role="img"` y `aria-label={`Avatar de ${nombre}`}`
5. Hero en `HomePage.tsx`:
   `alt="Pistas de pádel iluminadas en interior — Club Pádel Calatrava"`
6. `LightboxGaleria.tsx`:
   Heredar el `alt` de la foto activa.
7. Logos y favicon:
   `alt="Logo Pádel Reservas"`

## Verificación
- Ninguna imagen debe quedar sin atributo `alt`.
- `npm run build` y `npm run lint`.
