export function DemoBanner() {
  return (
    <div className="relative z-50 w-full border-b border-white/10 bg-black/40 px-4 py-1.5 text-center text-xs text-muted-foreground backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-between">
        <span>🚧 Proyecto de demostración · Datos ficticios con fines educativos</span>
        <a
          href="https://github.com/alexoca1/reserva-pistas-de-padel"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary transition hover:text-accent hover:underline"
        >
          Ver código en GitHub →
        </a>
      </div>
    </div>
  );
}
