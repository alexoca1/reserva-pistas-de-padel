import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface FotoLightbox {
  url: string;
  id: number;
  alt?: string;
  publicId?: string;
  esPortada?: boolean;
  orden?: number;
}

interface Props {
  fotos: FotoLightbox[];
  indiceInicial?: number;
  onCerrar: () => void;
  indice: number;
  onCambiarIndice: (i: number) => void;
  alt?: string;
}

export function LightboxGaleria({
  fotos,
  onCerrar,
  indice,
  onCambiarIndice,
}: Props) {
  const cerrarBtnRef = useRef<HTMLButtonElement>(null);
  const elementoPrevioRef = useRef<HTMLElement | null>(null);

  // Foco y navegación teclado (patrón spec 007)
  useEffect(() => {
    elementoPrevioRef.current = document.activeElement as HTMLElement;
    cerrarBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowRight")
        onCambiarIndice((indice + 1) % fotos.length);
      if (e.key === "ArrowLeft")
        onCambiarIndice((indice - 1 + fotos.length) % fotos.length);
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      elementoPrevioRef.current?.focus();
    };
  }, [indice, fotos.length, onCerrar, onCambiarIndice]);

  if (fotos.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de fotos"
    >
      {/* Fondo clicable para cerrar */}
      <button
        type="button"
        className="absolute inset-0"
        onClick={onCerrar}
        aria-label="Cerrar galería"
      />

      {/* Imagen */}
      <AnimatePresence mode="wait">
        <motion.img
          key={fotos[indice]?.id ?? indice}
          src={fotos[indice]?.url}
          alt={fotos[indice]?.alt || `Foto ${indice + 1} de ${fotos.length} — Club Pádel Calatrava`}
          className="relative z-10 max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        />
      </AnimatePresence>

      {/* Botón cerrar */}
      <button
        ref={cerrarBtnRef}
        type="button"
        onClick={onCerrar}
        className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20"
        aria-label="Cerrar"
      >
        ✕
      </button>

      {/* Prev / Next */}
      {fotos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              onCambiarIndice((indice - 1 + fotos.length) % fotos.length)
            }
            className="absolute left-4 z-20 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20"
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onCambiarIndice((indice + 1) % fotos.length)}
            className="absolute right-14 z-20 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20"
            aria-label="Foto siguiente"
          >
            ›
          </button>
        </>
      )}

      {/* Contador */}
      <p className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-sm text-white/70">
        {indice + 1} / {fotos.length}
      </p>
    </div>
  );
}
