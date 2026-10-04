interface Props {
  url?: string | null;
  nombre?: string | null;
  apellidos?: string | null;
  id?: number | null;
  size?: number;
}

// Paleta consistente derivada del id del usuario
const COLORES = [
  "bg-primary/30 text-primary",
  "bg-blue-500/30 text-blue-300",
  "bg-purple-500/30 text-purple-300",
  "bg-amber-500/30 text-amber-300",
  "bg-rose-500/30 text-rose-300",
  "bg-emerald-500/30 text-emerald-300",
  "bg-cyan-500/30 text-cyan-300",
  "bg-orange-500/30 text-orange-300",
];

export function Avatar({
  url,
  nombre,
  apellidos,
  id = 0,
  size = 32,
}: Props) {
  const iniciales = [
    nombre?.[0] ?? "",
    apellidos?.[0] ?? "",
  ]
    .join("")
    .toUpperCase() || "?";

  const nombreCompleto =
    [nombre, apellidos].filter(Boolean).join(" ").trim() || nombre || "usuario";

  const color = COLORES[(id ?? 0) % COLORES.length];
  const estilo = { width: size, height: size, fontSize: size * 0.38 };

  if (url) {
    return (
      <img
        src={url}
        alt={`Foto de perfil de ${nombreCompleto}`}
        style={estilo}
        className="rounded-full object-cover ring-1 ring-white/20"
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`Avatar de ${nombreCompleto}`}
      style={estilo}
      className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 ${color}`}
    >
      {iniciales}
    </span>
  );
}
