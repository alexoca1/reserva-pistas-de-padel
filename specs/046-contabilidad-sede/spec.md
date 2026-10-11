# Spec: Contabilidad de la Sede
**Estado:** Implementado

## Resumen
Permite a los administradores del club consultar métricas contables resumidas (ingresos brutos, reembolsos emitidos, ingresos netos, reservas confirmadas y canceladas, y tasa de cancelación) para un periodo dado, así como exportar el detalle completo de transacciones en formato CSV descargable.

## Escenarios
- Como administrador, quiero ver los KPIs financieros y operativos en un rango de fechas para entender el rendimiento y las cancelaciones del club.
- Como administrador, quiero exportar un archivo CSV con el desglose de pagos y reservas en el periodo para su auditoría o integración externa.
- Como usuario sin rol de administrador, no debo tener acceso a las métricas contables ni a la exportación CSV.

## Requisitos funcionales
- RF-01: Exponer endpoint `GET /admin/contabilidad` accesible solo con `ROLE_ADMIN`, que devuelva `ContabilidadDTO` con totales y tasa de cancelación.
- RF-02: Exponer endpoint `GET /admin/contabilidad/csv` accesible solo con `ROLE_ADMIN`, que retorne un CSV con cabeceras `Content-Type: text/csv; charset=UTF-8` y `Content-Disposition`.
- RF-03: Crear página `ContabilidadPage` (`/admin/contabilidad`) con filtros por fecha ("Desde", "Hasta"), tarjetas KPI de métricas y botón de exportación CSV.
- RF-04: Añadir card de navegación "Contabilidad" en `DashboardPage` para administradores y registrar ruta en `App.tsx` y `Layout.tsx`.

## Fuera de alcance
- Facturación electrónica real o integración con agencias tributarias (todos los importes son simulados).
- Generación de PDF.

## Preguntas abiertas
- Ninguna.
