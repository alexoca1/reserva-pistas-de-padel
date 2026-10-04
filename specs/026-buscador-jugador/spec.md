# Spec: Buscador de jugador compartido (reemplaza selectores de admin)

**Estado:** Implementada

## Resumen
El selector `<select>` de "elegir jugador" está duplicado en cuatro
páginas — DashboardPage, ReservasPage, PerfilPage y la nueva sección
de reservas del Dashboard (spec 021). Esta spec lo extrae en un
componente `BuscadorJugador` que filtra por nombre, apellidos y
teléfono, y sustituye las cuatro copias.

## Escenarios
- Como administrador, quiero buscar un jugador escribiendo su nombre
  o teléfono, para encontrarlo rápido sin escanear una lista larga.
- Como administrador, quiero ver nombre y teléfono de cada resultado
  para confirmar visualmente que es la persona correcta antes de
  seleccionarla.
- Como sistema, quiero que el filtrado ocurra en cliente sobre la
  lista ya cargada, sin llamadas extra al backend.

## Requisitos funcionales
- RF-01: Input de texto con placeholder "Buscar por nombre o
  teléfono…" que filtra en tiempo real sobre el array de usuarios
  ya cargado en memoria.
- RF-02: Filtra por `nombre`, `apellidos` y `telefono`
  simultáneamente — una sola búsqueda sirve para los tres campos.
- RF-03: Cada resultado muestra nombre completo y teléfono.
- RF-04: Al seleccionar un resultado, el input muestra el nombre
  elegido como chip; la lista se cierra.
- RF-05: Un botón "✕" en el chip limpia la selección y vuelve al
  estado de búsqueda.
- RF-06: Navegación completa con teclado: flechas arriba/abajo para
  moverse por resultados, Enter para seleccionar, Escape para cerrar
  la lista sin seleccionar.
- RF-07: Accesible: `role="combobox"`, `aria-expanded`,
  `role="listbox"`, `role="option"` en cada resultado.
- RF-08: Si no hay resultados para la búsqueda, muestra "Sin
  resultados".
- RF-09: El componente es un reemplazo directo del `<select>` en las
  cuatro páginas — misma interfaz de props: `usuarios`, `value`,
  `onChange`, `id`.
- RF-10: Visible solo cuando el usuario tiene `ROLE_ADMIN` — la
  lógica de visibilidad sigue en la página, no en el componente.

## Fuera de alcance
- Paginación de resultados (el número de usuarios de un club de
  pádel no lo justifica).
- Búsqueda por email — nombre y teléfono cubren los casos reales
  del admin.
- Endpoint nuevo de búsqueda en backend.
- Crear usuario desde el buscador.

## Preguntas abiertas
Ninguna.