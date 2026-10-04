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
