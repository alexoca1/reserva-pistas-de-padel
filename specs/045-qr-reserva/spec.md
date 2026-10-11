# Spec: QR de Acceso por Reserva
**Estado:** Implementado

## Resumen
Permite a los usuarios disponer de un código QR en su tarjeta de reserva para validar su acceso al club, y a los administradores escanearlo o validar manualmente el código para verificar la reserva y el estado de acceso a la pista.

## Escenarios
- Como usuario, quiero ver un código QR asociado a mi reserva en mi tarjeta de reserva (siempre que no esté cancelada) para poder mostrarlo al entrar al club.
- Como administrador, quiero escanear una imagen/foto con código QR o introducir el código manualmente en una página dedicada para validar la reserva de forma rápida.
- Como sistema, solo administradores autenticados pueden acceder a los datos de validación QR mediante la API.

## Requisitos funcionales
- RF-01: Exponer endpoint `GET /reservas/validar-qr?codigo={codigo}` en el backend accesible exclusivamente con rol `ROLE_ADMIN`, retornando `ValidacionQRDTO`.
- RF-02: Generar QR visual en `TarjetaReserva` usando `qrcode.react` (formato SVG) a partir de `reserva.codigoReserva` cuando el estado no sea CANCELADA.
- RF-03: Crear página `ValidarQRPage` (`/admin/validar-qr`) con entrada manual y escaneo de imágenes mediante `jsqr`.
- RF-04: Añadir acceso en `DashboardPage` (card "Validar QR" en grid de admin) y en el enrutamiento protegido.

## Fuera de alcance
- Escaneo continuo por streaming de vídeo WebRTC (se utiliza captura de foto/archivo con `input type="file"`).
- Validación sin conexión (offline).

## Preguntas abiertas
- Ninguna.
