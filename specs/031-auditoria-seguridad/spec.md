# Spec 031 — Auditoría de Seguridad

## Objetivo
Auditar el estado de seguridad del proyecto en dos dimensiones:
1. **Dependencias vulnerables** — detectar CVEs conocidos en las librerías del backend.
2. **Secretos en historial Git** — verificar que ninguna credencial real haya sido
   comprometida en el historial de commits.

## Alcance
- Solo backend (`padel-backend/`).
- Solo auditoría y reporte: **no se modifica ningún archivo de código**.
- Resultados documentados en `tasks.md`.

## Herramientas utilizadas
| Herramienta | Propósito |
|---|---|
| OWASP Dependency Check (Maven plugin) | Escaneo de CVEs en dependencias del classpath |
| `git log --all -p \| grep` | Búsqueda de patrones de secretos en el historial |

## Criterios de aceptación
- [ ] Informe HTML de OWASP generado en `target/dependency-check-report.html`.
- [ ] Inventario de dependencias escaneadas documentado.
- [ ] CVEs críticos o altos identificados y catalogados (o confirmada su ausencia).
- [ ] Historial Git auditado para passwords, API keys y application.properties.
- [ ] `tasks.md` actualizado con los resultados reales de cada tarea.

## Notas
- Esta spec no genera historia de usuario ni código nuevo.
- Si se detectan CVEs de severidad Critical/High, se creará una spec posterior
  para actualizarlos.
- Si se detectan secretos en el historial, se recomienda rotar las credenciales
  y usar `git filter-repo` para limpiar el historial.
