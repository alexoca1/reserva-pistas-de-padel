# Spec: Edición de datos personales (usuario propio y admin sobre otros)

**Estado:** Completado

## Resumen
No existe forma de editar nombre, apellidos ni teléfono después del registro.
Esto se vuelve más urgente tras la spec 014 (teléfono bloqueado en el
formulario de reserva): si el dato del perfil está desactualizado, ya no hay
forma de corregirlo desde ahí. Se añade una página de perfil donde cualquier
usuario edita sus propios datos, y donde un admin además puede editar los
datos de cualquier otro jugador.

## Escenarios

- Como usuario (normal o admin), quiero editar mi nombre, apellidos y
  teléfono, para mantenerlos al día sin depender de nadie más.
- Como administrador, quiero poder corregir los datos de otro jugador (por
  ejemplo si cambió de número y no puede hacerlo él mismo), igual que ya
  puedo reservar en su nombre.
- Como usuario, tras guardar mis datos, quiero que el resto de la app
  (Navbar, formulario de reserva) refleje el cambio al instante, sin tener
  que recargar ni volver a iniciar sesión.
- Como administrador, al editar los datos de otro jugador, quiero que mis
  propios datos de sesión no se vean afectados.

## Requisitos funcionales

- RF-01: Página nueva `/perfil`, accesible a cualquier usuario autenticado
  (normal o admin).
- RF-02: La página siempre muestra una sección "Mis datos" con nombre,
  apellidos y teléfono del usuario autenticado, editables; el email se
  muestra de solo lectura como referencia. Un botón guarda los cambios.
- RF-03: Si el usuario es admin, la página muestra además una segunda
  sección "Editar datos de un jugador": un selector de jugador (mismo origen
  de datos que los selectores ya existentes: `usuariosService.getAll()`,
  excluyendo al propio admin) y, al elegir uno, un formulario independiente
  con nombre, apellidos y teléfono de ese jugador, editable, con su propio
  botón de guardar.
- RF-04: Email, contraseña, roles y estado (`enabled`) no son editables
  desde esta página — quedan fuera de alcance explícito.
- RF-05: `PUT /auth/perfil` acepta `nombre`, `apellidos`, `telefono` y un
  `usuarioId` opcional. Si quien llama es admin y `usuarioId` viene
  informado, actualiza ese usuario; en cualquier otro caso, actualiza al
  usuario autenticado (mismo patrón que `resolverTitular` de la spec 010).
- RF-06: Si `usuarioId` no corresponde a un usuario existente, `400` con
  mensaje claro.
- RF-07: Un usuario no-admin que envíe `usuarioId` lo ve ignorado — no puede
  editar los datos de otra cuenta.
- RF-08: Al guardar la sección "Mis datos" con éxito, el `AuthContext` se
  actualiza en memoria con los nuevos valores, sin necesidad de recargar la
  página ni de un nuevo login.
- RF-09: Al guardar la sección "Editar datos de un jugador" con éxito, no se
  modifica el `AuthContext` del admin — solo se refresca localmente la
  entrada de ese jugador en la lista ya cargada.
- RF-10: Se añade un enlace "Perfil" al `Navbar` (versión escritorio y
  móvil), visible solo si el usuario está autenticado, junto a Dashboard/
  Pistas/Reservas.
- RF-11: Confirmación de éxito vía `useToast().mostrarToast(...)` en ambas
  secciones, siguiendo el patrón de la spec 008.

## Fuera de alcance

- Cambio de email (afecta la identidad de login, requiere manejo aparte).
- Cambio de contraseña (requiere confirmación de contraseña actual, spec
  propia por seguridad).
- Gestión de roles o habilitación/deshabilitación de cuentas.
- Un endpoint `GET` por id de usuario — el admin ya tiene la lista completa
  vía `/auth/usuarios`, se reutiliza para poblar el formulario localmente.
- Página de listado/gestión de usuarios independiente — se integra en
  `/perfil` como segunda sección, siguiendo el patrón ya documentado en
  `padel-frontend/AGENTS.md` de widgets condicionados por rol dentro de la
  misma página (spec 011).

## Preguntas abiertas

Ninguna.