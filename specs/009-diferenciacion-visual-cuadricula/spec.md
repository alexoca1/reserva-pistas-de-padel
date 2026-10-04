# Spec: Diferenciación visual de estados en la cuadrícula de disponibilidad

**Estado:** Completado

## Resumen
En la cuadrícula (spec 003), las celdas "Disponible" y "Ocupada" son casi
idénticas en reposo — mismo fondo casi transparente, mismo borde apenas
visible — y solo se distinguen por el texto. El usuario tiene que leer
celda por celda en vez de identificar el estado de un vistazo.

## Escenarios

- Como usuario, quiero distinguir a simple vista, sin leer texto, si una
  franja está disponible, ocupada, o es mi propia reserva.
- Como usuario con dificultad de visión de color, quiero que la diferencia
  no dependa solo del color, sino también de forma/relleno/icono.
- Como usuario, quiero que solo las celdas accionables (disponibles, o mi
  propia reserva) den sensación de ser clicables; las ocupadas por otros no.

## Requisitos funcionales

- RF-01: Las celdas "Disponible" tienen borde discontinuo visible e icono
  "+", sin relleno en reposo; al pasar el cursor, fondo y borde se
  intensifican con el color primario.
- RF-02: Las celdas "Ocupada" tienen relleno sólido (visiblemente más
  opaco que "Disponible") e icono de candado; no reaccionan al hover ni
  muestran cursor de puntero.
- RF-03: Las celdas "Tu reserva" mantienen el estilo verde ya existente.
- RF-04: La leyenda superior usa los mismos iconos y estilos exactos que
  las celdas, no una aproximación.
- RF-05: El texto usa la etiqueta ya en producción ("Disponible").

## Fuera de alcance

- Cambios en la lógica de qué celda es libre/ocupada/propia (`resolverSlot`).
- Cambios de backend.
- Tooltips sobre celdas ocupadas.

## Preguntas abiertas

Ninguna.