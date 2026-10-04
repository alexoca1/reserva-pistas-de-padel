# Spec 032 — Aviso Legal, Banner de Demo y Cumplimiento RGPD

**Estado:** Implementada  
**Fecha:** 2026-10-03  
**Afecta:** Solo frontend (`padel-frontend`: `DemoBanner.tsx`, `CookieBanner.tsx`, `PrivacidadPage.tsx`, `TerminosPage.tsx`, `Layout.tsx`, `App.tsx`)

---

## Resumen

Este proyecto es una aplicación de demostración de portfolio para el club ficticio "Club Pádel Calatrava" (repositorio: `https://github.com/alexoca1/reserva-pistas-de-padel`). Para clarificar el propósito educativo del software, cumplir con las normativas legales (RGPD/LOPD-GDD y LSSI-CE en España) y dar una experiencia profesional completa, se implementa:
1. Un banner fijo superior permanente indicando que es un proyecto de demostración con enlace a GitHub.
2. Páginas públicas de Política de Privacidad y Términos y Condiciones con contenido legal realista adaptado a la gestión de reservas de pádel.
3. Un banner de cookies técnicas no intrusivo con persistencia del consentimiento en `localStorage`.
4. Enlaces en el pie de página y actualización de títulos de página dinámicos.

---

## Escenarios

- **Como visitante o reclutador**, veo un banner superior discreto pero permanente en cualquier pantalla que me indica que es un proyecto de demostración y me permite navegar a su código fuente en GitHub con un clic.
- **Como usuario**, puedo acceder sin iniciar sesión a `/privacidad` y `/terminos` desde el footer para consultar el tratamiento de mis datos y las normas de uso y cancelación de reservas.
- **Como usuario en su primera visita**, visualizo en la parte inferior un aviso de cookies técnicas necesarias con botones para aceptar o consultar la política de privacidad. Una vez aceptado, no vuelve a mostrarse en visitas posteriores.

---

## Requisitos funcionales

### RF-01 — Banner de demostración (`DemoBanner.tsx`)
- Barra delgada ubicada fijamente en la parte superior antes del contenido/Layout.
- Texto: `"🚧 Proyecto de demostración · Datos ficticios con fines educativos"`.
- Enlace a la derecha: `"Ver código en GitHub →"` con `target="_blank"` y `rel="noopener noreferrer"` apuntando a `https://github.com/alexoca1/reserva-pistas-de-padel`.
- Estilo: fondo `bg-black/40`, `backdrop-blur`, borde inferior `border-white/10`, tipografía `text-xs text-muted-foreground`, padding `py-1.5`.
- Visible en todas las rutas de la aplicación, incluyendo la página 404 (`NotFoundPage`).
- No almacena estado de cerrado ni cuenta con botón de dismiss (es permanente).

### RF-02 — Política de Privacidad (`PrivacidadPage.tsx`)
- Ruta accesible públicamente: `/privacidad`.
- Encabezado con `Badge variant="default"`: `"Proyecto de demostración educativa — los datos de contacto son ficticios"`.
- Contenido detallado conforme a RGPD:
  - Responsable del tratamiento: Club Pádel Calatrava (ficticio).
  - Datos recopilados: identificación (nombre, apellidos), contacto (email, teléfono), datos de reservas, contraseñas hash (bcrypt) y logs técnicos.
  - Base jurídica: ejecución de contrato/servicio (reservas), interés legítimo (seguridad de la plataforma), cumplimiento legal.
  - Ejercicio de derechos: acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición (arts. 15 a 22 RGPD).
  - Política de cookies técnicas y de sesión.
  - Contacto DPO ficticio (`dpo@padelreservas.es`).
- Componentes UI basados en `Card`, `Badge` y estilo glassmorphism acorde al sistema de diseño.

### RF-03 — Términos y Condiciones (`TerminosPage.tsx`)
- Ruta accesible públicamente: `/terminos`.
- Encabezado con aviso de demo mediante `Badge`.
- Contenido detallado:
  - Objeto del servicio de reservas online del Club Pádel Calatrava.
  - Condiciones de uso de la cuenta y veracidad de datos.
  - Reglas de reserva de pistas y franjas horarias.
  - Política de cancelación (alineada con la spec 020: antelación mínima de cancelación y liberación de slots).
  - Normas de uso de instalaciones y exención de responsabilidad por causas meteorológicas en pistas exteriores.
  - Legislación aplicable (Derecho español) y fueros competentes.

### RF-04 — Banner de consentimiento de cookies (`CookieBanner.tsx`)
- Se renderiza al pie (`fixed bottom-0 inset-x-0 z-50`).
- Comprueba si existe la clave `"cookie_consent"` en `localStorage`. Si está presente con valor `"accepted"`, no se renderiza.
- Mensaje: `"Usamos cookies técnicas necesarias para el funcionamiento de la aplicación. No usamos cookies de seguimiento ni publicidad."`
- Botones:
  - `"Aceptar"`: guarda `"accepted"` en `localStorage.setItem("cookie_consent", "accepted")` y oculta el banner.
  - `"Ver política"`: redirige mediante navegación interna a `/privacidad`.
- Estilo coherente con el sistema de diseño glassmorphism (`backdrop-blur-xl`, borde sutil, botones existentes).

### RF-05 — Navegación, Enlaces y Títulos
- Actualizar `src/App.tsx`:
  - Registrar rutas públicas `/privacidad` y `/terminos` dentro del `Layout`.
  - Renderizar `<DemoBanner />` en el nivel superior antes de las rutas.
  - Renderizar `<CookieBanner />` dentro del contexto del Router para posibilitar navegación.
- Actualizar `src/components/Layout.tsx`:
  - Añadir enlaces hacia `/privacidad` y `/terminos` en el footer.
  - Añadir entradas en `TITULOS_POR_RUTA`:
    - `"/privacidad"`: `"Política de Privacidad"`
    - `"/terminos"`: `"Términos y Condiciones"`

---

## Fuera de alcance
- Conexión con servicios de tracking analítico o de terceros (Google Analytics, Meta Pixel).
- Formularios de ejercicio de derechos ARCO/RGPD interactivos en backend (se gestiona vía canal de contacto informativo).
- Modificaciones al backend o bases de datos.
