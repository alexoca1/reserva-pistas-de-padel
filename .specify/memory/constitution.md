# Constitución del proyecto: Reserva de Pistas de Pádel

**Versión:** 1.1.0
**Última actualización:** 2026-09-20

Este documento es la fuente única de verdad de las reglas del proyecto para
cualquier agente (humano o IA) que trabaje en él. Toda spec, plan o tarea debe
respetar estos principios; si un principio bloquea una feature, se discute
aquí primero, no se ignora en silencio.

## Artículo 1 — Filosofía Ponytail (lazy senior dev)

Lazy significa eficiente, no descuidado. El mejor código es el que no hace
falta escribir. Antes de escribir código, para en el primer peldaño que
aplique:

1. ¿Hace falta construir esto? (YAGNI)
2. ¿Ya existe en este código base? Reutiliza el helper, util o patrón ya
   presente, no lo reescribas.
3. ¿La librería estándar ya lo hace? Úsala.
4. ¿Una función nativa de la plataforma ya lo cubre? Úsala.
5. ¿Una dependencia ya instalada lo resuelve? Úsala.
6. ¿Se puede hacer en una línea? Hazlo en una línea.
7. Solo entonces: escribe el mínimo código que funcione.

La escalera se sube **después** de entender el problema, no en su lugar: lee
la tarea y el código que toca, sigue el flujo real de principio a fin, y
recién entonces sube.

**Fix de bugs = causa raíz, no síntoma.** Un reporte describe un síntoma.
Busca todas las llamadas a la función que vas a tocar y arregla la función
compartida una sola vez — una guarda ahí es un diff más pequeño que una por
cada llamador, y parchear solo el camino que menciona el ticket deja a un
hermano roto.

### Reglas

- Ninguna abstracción que no se haya pedido explícitamente.
- Ninguna dependencia nueva si se puede evitar.
- Ningún boilerplate que nadie pidió.
- Borrado sobre adición. Aburrido sobre ingenioso. El menor número de
  archivos posible.
- Gana el diff más corto que funcione, pero solo una vez entendido el
  problema. El cambio más pequeño en el lugar equivocado no es "lazy", es un
  segundo bug.
- Cuestiona los pedidos complejos: "¿de verdad necesitas X, o Y ya lo cubre?"
- Ante dos enfoques de librería estándar del mismo tamaño, elige el que sea
  correcto en los casos borde — lazy es menos código, no el algoritmo más
  frágil.
- Marca las simplificaciones deliberadas que recortan una esquina real con
  un techo conocido (lock global, escaneo O(n²), heurística ingenua) con un
  comentario `ponytail:` que nombre el techo y la vía de mejora futura.

### No aplica "lazy" a

Entender el problema (leerlo completo y seguir el flujo real antes de elegir
peldaño), validación de entradas en fronteras de confianza, manejo de errores
que evita pérdida de datos, seguridad, accesibilidad, la calibración que
necesita el hardware real, y cualquier cosa pedida explícitamente. Código
lazy sin su verificación está inacabado: toda lógica no trivial deja UNA
comprobación ejecutable (un assert de autochequeo o un test pequeño; sin
frameworks, sin fixtures). Los one-liners triviales no necesitan test.

## Artículo 2 — Principios generales

- **Cambios mínimos**: modificar estrictamente lo necesario para resolver la
  tarea.
- **Borrado sobre adición**: priorizar eliminar código no usado, redundante
  o deprecado antes de introducir nuevas clases, abstracciones o
  dependencias.
- **Librerías nativas primero**: preferir siempre las utilidades integradas
  del lenguaje/entorno antes de agregar librerías externas superfluas.
- **Proporcionalidad de la documentación SDD**: reservar el ciclo completo
  (`spec.md` + `plan.md` + `tasks.md` + `prompt.md` opcional) para cambios
  que toquen más de 2 archivos, introduzcan una decisión de diseño real que
  valga la pena no tener que redebatir, o afecten seguridad/datos de
  usuario. Un cambio de 1-2 archivos sin alternativas que descartar se
  documenta en un único `spec.md` (Resumen + Requisitos funcionales +
  Tareas en la misma sección), sin `plan.md` ni `prompt.md` separados.

## Artículo 3 — Backend (`padel-backend`)

- **Inyección de dependencias**: usar siempre `@RequiredArgsConstructor` de
  Lombok para inyección por constructor. Prohibido `@Autowired` en
  atributos/campos directos.
- **Utilidades nativas de Java 17/21**: usar `Objects.requireNonNull()`,
  `String.isBlank()`, `List.of()`, `Set.of()` antes de añadir dependencias
  externas.
- **Evitar abstracciones innecesarias**: en CRUD sencillos, omitir
  interfaces y clases `ServiceImpl` a menos que haya múltiples reglas de
  negocio complejas.
- **Verificación y pruebas**: toda lógica nueva no trivial debe acompañarse
  de una prueba JUnit ejecutable mediante `./mvnw test`.

## Artículo 4 — Frontend (`padel-frontend`)

- **Componentes nativos HTML5**: priorizar elementos nativos (`<input
  type="date">`, `<input type="color">`) sobre librerías pesadas de
  componentes UI externas.
- **Cliente HTTP centralizado**: usar exclusivamente la instancia
  centralizada en `src/services/api.ts`, sin instanciar nuevos clientes
  (`axios`/`fetch`).
- **Tokens en memoria**: los Access Tokens viven únicamente en memoria de la
  aplicación (nunca en `localStorage`/`sessionStorage`); peticiones con
  `credentials: "include"`.
- **Reutilización de componentes UI**: no crear componentes nuevos en
  `src/components/ui` si el caso de uso se resuelve con los existentes
  (`button`, `input`, `card`).
- **Librerías nuevas**: permitidas cuando resuelven algo que HTML/CSS/React
  puro no cubre bien. Cada dependencia nueva en `package.json` necesita una
  razón concreta, no se añade "por si acaso".

## Artículo 5 — Seguridad y control de acceso (no negociable)

*Añadido tras `specs/001-seguridad-autorizacion-api`.*

- **El backend es el único punto de aplicación de permisos.** Ocultar un
  dato en el frontend (condicionales de UI, campos no renderizados) es UX,
  nunca control de acceso. Si un dato no debe verse, no debe salir del
  backend para ese usuario.
- **Todo endpoint nuevo que devuelva o modifique datos de un usuario debe
  declarar explícitamente su regla de acceso** (público / autenticado /
  propietario-o-admin / solo-admin) en la spec correspondiente, antes de
  implementarlo.
- **Todo cambio de autorización (`@PreAuthorize`, `permitAll`, filtrado por
  usuario) se acompaña de un test de seguridad** que pruebe el caso
  denegado, no solo el caso permitido (ver `ReservasControllerSecurityTest`,
  `AuthControllerSecurityTest`, `PistasControllerSecurityTest` como
  patrón).

## Gobernanza

- Esta constitución prevalece sobre preferencias de estilo individuales en
  `specs/*/plan.md`. Si un plan necesita romper un artículo, la spec debe
  decirlo explícitamente y justificar por qué.
- `.github/copilot-instructions.md` mantiene su propio contenido completo
  (Copilot solo lee esa ruta), pero debe mantenerse sincronizado a mano con
  el Artículo 1 de este documento — son pocas líneas, revisarlo al editar
  cualquiera de los dos.
- Toda spec que añada un archivo, endpoint o campo de DTO nuevo debe
  reflejarse en el `AGENTS.md` correspondiente (estructura de paquetes,
  tabla de endpoints, DTOs) antes de cerrarse. Si no ocurre como parte
  natural de otra tarea, la última tarea de `tasks.md` debe cubrirlo
  explícitamente.
- Cambios a este documento suben la versión: parche (aclaración de
  redacción), menor (nuevo principio), mayor (cambio que invalida specs
  existentes).