# Prompt de implementación — spec 026

Implementa specs/026-buscador-jugador siguiendo spec.md, plan.md y
tasks.md (T01-T07). Sigue .specify/memory/constitution.md — sin
dependencias nuevas, componente de React puro.

Prerequisito: specs 011, 015 y 021 implementadas (los `<select>`
que se van a reemplazar deben existir en el código).

Lee antes de empezar: `DashboardPage.tsx`, `ReservasPage.tsx`,
`PerfilPage.tsx` completos — identifica en cada uno el bloque exacto
del `<Select>` de jugador antes de tocar nada.

---

## T01 — Crear components/BuscadorJugador.tsx

```tsx
import {
  useEffect,
  useRef,
  useState,
  useId,
} from "react";
import type { Usuario } from "../types";

interface Props {
  usuarios: Usuario[];
  value: number | null;
  onChange: (id: number | null) => void;
  id?: string;
}

const MAX_RESULTADOS = 8;

export function BuscadorJugador({ usuarios, value, onChange, id }: Props) {
  const [query, setQuery] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const usuarioSeleccionado = value !== null
    ? usuarios.find((u) => u.id === value) ?? null
    : null;

  const resultados =
    query.trim().length === 0
      ? []
      : usuarios
          .filter((u) => {
            const texto = [u.nombre, u.apellidos, u.telefono]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return texto.includes(query.toLowerCase());
          })
          .slice(0, MAX_RESULTADOS);

  // Resetea el índice activo cuando cambian los resultados
  useEffect(() => {
    setIndiceActivo(0);
  }, [query]);

  const seleccionar = (usuario: Usuario) => {
    onChange(usuario.id);
    setQuery("");
    setAbierto(false);
  };

  const limpiar = () => {
    onChange(null);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!abierto) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceActivo((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (resultados[indiceActivo]) seleccionar(resultados[indiceActivo]);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  };

  const nombreCompleto = (u: Usuario) =>
    `${u.nombre ?? ""} ${u.apellidos ?? ""}`.trim() || u.email;

  // — Estado: usuario ya seleccionado (chip) —
  if (usuarioSeleccionado) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
        <span className="flex-1 text-sm text-card-foreground">
          {nombreCompleto(usuarioSeleccionado)}
          {usuarioSeleccionado.telefono && (
            <span className="ml-2 text-muted-foreground">
              · {usuarioSeleccionado.telefono}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={limpiar}
          className="text-muted-foreground hover:text-card-foreground transition"
          aria-label="Limpiar selección"
        >
          ✕
        </button>
      </div>
    );
  }

  // — Estado: buscando —
  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={abierto && resultados.length > 0}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={
          abierto && resultados[indiceActivo]
            ? `${listId}-option-${indiceActivo}`
            : undefined
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => query.trim() && setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por nombre o teléfono…"
        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        autoComplete="off"
      />

      {abierto && query.trim().length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-card/95 shadow-xl backdrop-blur-xl"
        >
          {resultados.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Sin resultados
            </li>
          ) : (
            resultados.map((u, i) => (
              <li
                key={u.id}
                id={`${listId}-option-${i}`}
                role="option"
                aria-selected={i === indiceActivo}
                onMouseDown={() => seleccionar(u)}
                onMouseEnter={() => setIndiceActivo(i)}
                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition ${
                  i === indiceActivo
                    ? "bg-primary/15 text-primary"
                    : "text-card-foreground hover:bg-white/5"
                }`}
              >
                <span>{nombreCompleto(u)}</span>
                {u.telefono && (
                  <span className="text-xs text-muted-foreground">
                    {u.telefono}
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
```

---

## T02 — DashboardPage.tsx

Localiza el bloque del `<Select>` de jugador (introducido en specs
011 y 021). Sustitúyelo por `<BuscadorJugador>`.

Añade el import:
```ts
import { BuscadorJugador } from "@/components/BuscadorJugador";
```

Sustituye:
```diff
-<Select
-  id="dashboardUsuarioSelect"
-  value={usuarioSeleccionadoId !== null
-    ? String(usuarioSeleccionadoId) : ""}
-  onChange={(e) =>
-    setUsuarioSeleccionadoId(
-      e.target.value ? Number(e.target.value) : null)
-  }
->
-  <option value="">Selecciona un jugador</option>
-  {usuarios.map((u) => { ... })}
-</Select>
+<BuscadorJugador
+  id="dashboardUsuarioSelect"
+  usuarios={usuarios}
+  value={usuarioSeleccionadoId}
+  onChange={setUsuarioSeleccionadoId}
+/>
```

El `<Label htmlFor="dashboardUsuarioSelect">` existente no cambia.

---

## T03 — ReservasPage.tsx

Localiza el `<Select>` de "reservar en nombre de" en el formulario
de nueva/editar reserva, visible solo para admin. Aplica el mismo
patrón:

```diff
-import { Select } from "@/components/ui/select";
+import { BuscadorJugador } from "@/components/BuscadorJugador";

-<Select
-  value={usuarioSeleccionadoId !== null
-    ? String(usuarioSeleccionadoId) : ""}
-  onChange={(e) =>
-    setUsuarioSeleccionadoId(
-      e.target.value ? Number(e.target.value) : null)
-  }
->
-  <option value="">— Jugador (por defecto: tú mismo) —</option>
-  {usuarios.map(...)}
-</Select>
+<BuscadorJugador
+  usuarios={usuarios.filter((u) => u.id !== user?.id)}
+  value={usuarioSeleccionadoId}
+  onChange={setUsuarioSeleccionadoId}
+/>
```

El filtro `u.id !== user?.id` ya existía en el `<Select>` original
para excluir al propio admin — mantenlo.

---

## T04 — PerfilPage.tsx

Localiza el `<Select>` de "editar datos de un jugador" en la sección
admin. Aplica el mismo patrón:

```diff
+import { BuscadorJugador } from "@/components/BuscadorJugador";

-<Select
-  value={usuarioSeleccionadoId !== null
-    ? String(usuarioSeleccionadoId) : ""}
-  onChange={(e) => { ... }}
->
-  <option value="">Selecciona un jugador</option>
-  {usuarios
-    .filter((u) => u.id !== user?.id)
-    .map(...)}
-</Select>
+<BuscadorJugador
+  usuarios={usuarios.filter((u) => u.id !== user?.id)}
+  value={usuarioSeleccionadoId}
+  onChange={setUsuarioSeleccionadoId}
+/>
```

---

## T05 — Confirmar limpieza

Después de los tres cambios anteriores, busca en todo el proyecto
(grep o búsqueda global en el IDE) cualquier uso de `<Select>` o
`<select>` para selección de jugador. No debe quedar ninguno en las
tres páginas modificadas.

---

## T06 — padel-frontend/AGENTS.md

Añade junto a la lista de componentes:

```diff
+- `BuscadorJugador.tsx`: combobox accesible de búsqueda de usuario
+  por nombre o teléfono. Componente estándar para cualquier selector
+  de jugador en contextos de admin — reemplaza `<Select>` nativo en
+  DashboardPage, ReservasPage y PerfilPage. Props: `usuarios`,
+  `value` (id | null), `onChange`, `id`.
```

---

## T07 — Verificación manual

1. **Dashboard (admin)**: escribir nombre parcial → resultados
   aparecen con nombre y teléfono; seleccionar → chip con "✕";
   limpiar → input vacío de nuevo; buscar por teléfono → funciona.
2. **Teclado**: abrir lista con texto, bajar con ↓, subir con ↑,
   seleccionar con Enter, cerrar sin seleccionar con Escape.
3. **ReservasPage (admin)**: abrir formulario de nueva reserva →
   buscador en lugar del select; el propio admin no aparece en
   resultados.
4. **PerfilPage (admin)**: sección "Editar datos de un jugador" →
   buscador funciona igual; el propio admin no aparece.
5. **Usuario sin ROLE_ADMIN**: en ninguna de las tres páginas
   aparece el buscador — la visibilidad condicional no cambió.

No añadas dependencias nuevas. No toques el backend.