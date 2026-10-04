# Prompt de implementación — Spec 032: Aviso Legal, Banner de Demo y RGPD

Implementa la spec 032 siguiendo `spec.md`, `plan.md` y `tasks.md`.

## Contexto del proyecto
- Club ficticio: "Club Pádel Calatrava"
- Repositorio GitHub: `https://github.com/alexoca1/reserva-pistas-de-padel`

---

## T01 — `src/components/DemoBanner.tsx`
- Barra fija encima del Navbar.
- Texto: `"🚧 Proyecto de demostración · Datos ficticios con fines educativos"`
- Enlace: `"Ver código en GitHub →"` a `https://github.com/alexoca1/reserva-pistas-de-padel` con `target="_blank"` y `rel="noopener noreferrer"`.
- Estilos: `bg-black/40 backdrop-blur border-b border-white/10 text-muted-foreground text-xs py-1.5 text-center`.
- Permanente, sin botón de cierre.

---

## T02 — `src/pages/PrivacidadPage.tsx`
- Ruta: `/privacidad` (pública, sin login requerido).
- Encabezado con `<Badge variant="default">Proyecto de demostración educativa — los datos de contacto son ficticios</Badge>`.
- Secciones RGPD claras estructuradas en `Card`:
  1. Responsable del tratamiento (Club Pádel Calatrava, NIF ficticio, Ciudad Real).
  2. Datos personales tratados (identificación, contacto, reservas, credenciales cifradas).
  3. Finalidad y base jurídica del tratamiento (ejecución de servicio, seguridad e interés legítimo).
  4. Plazos de conservación de datos.
  5. Derechos del usuario (acceso, rectificación, supresión, oposición, limitación y portabilidad).
  6. Política de cookies técnicas (exclusivamente técnicas y de autenticación).
  7. Contacto DPO / Delegado de Protección de Datos (`dpo@padelreservas.es`).

---

## T03 — `src/pages/TerminosPage.tsx`
- Ruta: `/terminos` (pública, sin login requerido).
- Encabezado con aviso de demo similar.
- Secciones estructuradas en `Card`:
  1. Objeto del servicio.
  2. Registro, cuentas de usuario y seguridad.
  3. Reservas, horarios y disponibilidad de pistas.
  4. Política de cancelación de reservas (coherente con antelación mínima de cancelación).
  5. Normas de uso y conducta en las pistas.
  6. Responsabilidad y condiciones meteorológicas.
  7. Legislación aplicable (España) y fuero judicial.

---

## T04 — `src/components/CookieBanner.tsx`
- Fixed `bottom-0`, ancho completo, estilo glassmorphism.
- Comprueba `localStorage.getItem("cookie_consent")`. Si es `"accepted"`, no se muestra.
- Texto: `"Usamos cookies técnicas necesarias para el funcionamiento de la aplicación. No usamos cookies de seguimiento ni publicidad."`
- Botones:
  - `"Aceptar"`: guarda `"accepted"` en `localStorage` y oculta el banner.
  - `"Ver política"`: navega a `/privacidad`.

---

## T05 & T06 — `Layout.tsx` y `App.tsx`
- `Layout.tsx`:
  - Enlaces a `/privacidad` y `/terminos` en el footer.
  - `TITULOS_POR_RUTA`: añadir `/privacidad` y `/terminos`.
- `App.tsx`:
  - Montar `<DemoBanner />` en la parte superior.
  - Montar rutas públicas `<Route path="privacidad" element={<PrivacidadPage />} />` y `<Route path="terminos" element={<TerminosPage />} />`.
  - Montar `<CookieBanner />`.
