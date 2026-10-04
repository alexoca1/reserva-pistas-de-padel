# Plan técnico: BuscadorJugador

**Spec relacionada:** ./spec.md

## Diseño

### Nuevo componente: components/BuscadorJugador.tsx

Props:
```ts
interface Props {
  usuarios: Usuario[];
  value: number | null;          // id del usuario seleccionado
  onChange: (id: number | null) => void;
  id?: string;                   // para el label externo
}
```

Estado interno:
- `query: string` — texto escrito en el input.
- `abierto: boolean` — si la lista desplegable está visible.
- `indiceActivo: number` — índice del resultado resaltado con flechas.

Lógica de filtrado (en cliente, sin backend):
```ts
const resultados = query.trim().length === 0
  ? []
  : usuarios.filter((u) => {
      const texto = [u.nombre, u.apellidos, u.telefono]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return texto.includes(query.toLowerCase());
    }).slice(0, 8); // máximo 8 resultados visibles
```

Cuando `value` tiene un id seleccionado, el componente muestra el
nombre del usuario elegido como chip con "✕", sin el input de
búsqueda activo — el mismo patrón que un select nativo una vez
elegida una opción, pero con botón de limpiar explícito.

Refs: `inputRef` para gestionar el foco al abrir/cerrar la lista;
`listRef` para `aria-controls`.

ARIA:
```tsx
<input
  role="combobox"
  aria-expanded={abierto}
  aria-autocomplete="list"
  aria-controls="buscador-listbox"
  aria-activedescendant={`buscador-option-${indiceActivo}`}
/>
<ul
  id="buscador-listbox"
  role="listbox"
>
  {resultados.map((u, i) => (
    <li
      key={u.id}
      id={`buscador-option-${i}`}
      role="option"
      aria-selected={i === indiceActivo}
    />
  ))}
</ul>
```

### Páginas a modificar

Las cuatro páginas sustituyen su `<Select>` + lógica de filtrado por
`<BuscadorJugador usuarios={usuarios} value={...} onChange={...} />`.
La carga de `usuariosService.getAll()` y el estado `usuarios` se
mantienen en cada página — el componente es solo presentacional, no
gestiona la carga de datos.

**DashboardPage.tsx** (specs 011 + 021): el selector ya existente en
la sección de reservas del jugador.

**ReservasPage.tsx**: el selector de "reservar en nombre de" en el
formulario de nueva reserva (solo visible para admin).

**PerfilPage.tsx** (spec 015): el selector de "editar datos de un
jugador".

## Decisiones y alternativas descartadas

- **`react-select` o `downshift`**: descartados — el Artículo 4
  dice "sin dependencias nuevas si se puede evitar"; un combobox
  para este caso de uso se resuelve en ~80 líneas de React+Tailwind
  puro.
- **Búsqueda en backend** (`GET /auth/usuarios?q=...`): descartada —
  la lista de usuarios de un club de pádel nunca crece a un tamaño
  donde el filtrado en cliente sea un problema. Un endpoint nuevo
  solo añadiría complejidad sin beneficio real.
- **Endpoint de búsqueda por teléfono**: descartado por la misma
  razón — filtrado en cliente es suficiente y ya disponemos del
  array completo.
- **Reemplazar el `<select>` de spec 021 antes de implementarla**
  (Opción B): descartado por decisión explícita — se implementa 021
  con `<select>`, esta spec llega después como refactor limpio.

## Impacto en seguridad
Ninguno — el componente es puramente presentacional. La lógica de
autorización (solo admin ve el buscador) sigue en cada página,
exactamente igual que antes.