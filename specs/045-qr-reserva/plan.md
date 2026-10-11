# Plan técnico: QR de Acceso por Reserva
**Spec relacionada:** spec.md

## Diseño
- Backend:
  - Record `ValidacionQRDTO` con los campos necesarios de la reserva.
  - Método en `ReservaRepository`: `Optional<Reserva> findByCodigoReserva(String codigoReserva)`.
  - Endpoint en `ReservasController`: `GET /reservas/validar-qr` protegido con `@PreAuthorize("hasRole('ADMIN')")`.
- Frontend:
  - Instalación de librerías `qrcode.react` (para renderizar QR como SVG) y `jsqr` (para decodificar QR desde fotos).
  - Tipo `ValidacionQR` en `types/index.ts` y método `validarQR` en `services/api.ts`.
  - Integración de `<QRCodeSVG>` en `TarjetaReserva.tsx`.
  - Creación de `ValidarQRPage.tsx` con input manual y lector `jsqr` vía canvas.
  - Card de navegación en `DashboardPage.tsx` para administradores.
  - Ruta `/admin/validar-qr` en `App.tsx` y título/descripción en `Layout.tsx`.

## Decisiones y alternativas descartadas
- Se usa `jsqr` sobre imágenes capturadas (`<input type="file" accept="image/*" capture="environment">`) para simplificar y no requerir streams pesados de cámara WebRTC ni permisos complejos de navegador continuo.
- Se usa `qrcode.react` (versión SVG) por ligereza y calidad vectorial sin dependencias de canvas pesadas.

## Impacto en seguridad
- Endpoint protegido exclusivamente para `ROLE_ADMIN`. Usuarios anónimos o `ROLE_USER` reciben 401 y 403 respectivamente. Verificado mediante tests de seguridad en `ReservasControllerSecurityTest`.
