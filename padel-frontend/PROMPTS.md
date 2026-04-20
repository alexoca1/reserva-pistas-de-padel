# PROMPTS CLAVE DEL PROYECTO

Documento de referencia con los prompts mas importantes usados durante el desarrollo de la app React de reservas de padel.

## Configuracion inicial

- Crea el frontend de una app de reservas de padel con React 18, Vite, Tailwind CSS y componentes reutilizables.
- Organiza el proyecto con estructura por paginas, componentes, context y servicios.

## Backend

- Conecta el frontend al backend en `http://localhost:8080` usando token JWT en `Authorization: Bearer`.
- Ajusta el payload de reservas para que sea compatible con backend enviando `fechaReserva`, `fecha`, `pistaId`, `usuarioId` y `usuario.id`.
- Revisa por que un usuario con `ROLE_USER` solo ve sus reservas y detecta si el filtrado esta ocurriendo en backend.
- Actualiza `AGENTS.md` para reflejar los endpoints reales del proyecto: `aulas` pasa a `/pistas` y `centros` pasa a `/reservas`, listando metodo HTTP, ruta, autenticacion y `ROLE_ADMIN`.

## Autenticacion

- Implementa autenticacion en contexto global con login, logout y perfil.
- Agrega helpers de rol en frontend: `roles`, `hasRole` e `isAdmin`.
- Protege rutas privadas y redirige al login si el usuario no esta autenticado.

## Paginas principales

- Crea `DashboardPage` personalizada con saludo al usuario, badge de rol y accesos rapidos a Pistas y Reservas.
- Crea `PistasPage` para listar pistas y mostrar vista de solo lectura para `ROLE_USER`.
- Crea `ReservasPage` con tabla, formularios modales y acciones por fila.
- Crea una pagina `404 NotFoundPage` con mensaje claro, numero 404 grande, diseno centrado y boton de `shadcn/ui` que use `useNavigate` para volver al inicio.

## CRUD

- Implementa CRUD completo de reservas con crear, editar y eliminar desde modales.
- Implementa CRUD de pistas solo para `ROLE_ADMIN`.
- Corrige error de DELETE con respuesta vacia (`204 No Content`) para evitar fallo al parsear JSON.
- En reservas, permite editar/eliminar solo a admin o propietario.

- Restringe creacion de reservas con reglas de negocio:
  - No permitir fechas anteriores a hoy.
  - Si es el mismo dia, inicio minimo 2 horas por encima de la hora actual.
  - Horario permitido de 06:00 a 23:00.
  - Hora fin siempre mayor que hora inicio.
  - Excluir del listado reservas de fechas pasadas.

## Diseno visual

- Mejora el Navbar para que sea totalmente responsive.
- En movil usa menu hamburguesa y despliegue vertical de enlaces.
- En escritorio mantiene layout horizontal.
- Usa solo Tailwind CSS y estado de React para abrir/cerrar menu, sin librerias extra.
