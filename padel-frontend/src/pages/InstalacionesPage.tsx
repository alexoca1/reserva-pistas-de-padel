import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { fotoPistaService, fotoSedeService, pistasService } from "../services/api";
import { LightboxGaleria, type FotoLightbox } from "@/components/LightboxGaleria";
import type { FotoSede, Pista } from "../types";

export function InstalacionesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fotos, setFotos] = useState<FotoSede[]>([]);
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [lightboxFotos, setLightboxFotos] = useState<FotoLightbox[]>([]);
  const [lightboxIndice, setLightboxIndice] = useState(0);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);

  useEffect(() => {
    fotoSedeService.getAll().then((data) => setFotos(data ?? [])).catch(() => {});
    pistasService
      .getAll()
      .then((data) =>
        setPistas(
          Array.isArray(data)
            ? [...data].sort((a, b) => (a.numeroPista ?? 0) - (b.numeroPista ?? 0))
            : []
        )
      )
      .catch(() => {});
  }, []);

  const abrirLightboxPista = async (pista: Pista) => {
    try {
      const fotosPista = await fotoPistaService.getAll(pista.id);
      if (fotosPista && fotosPista.length > 0) {
        setLightboxFotos(
          fotosPista.map((f, i) => ({
            ...f,
            alt: `Foto ${i + 1} de la pista ${pista.numeroPista} — Club Pádel Calatrava`,
          }))
        );
        setLightboxIndice(0);
        setLightboxAbierto(true);
      } else if (pista.imagenUrl) {
        setLightboxFotos([
          {
            id: 0,
            url: pista.imagenUrl,
            publicId: "",
            esPortada: true,
            orden: 0,
            alt: `Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`,
          },
        ]);
        setLightboxIndice(0);
        setLightboxAbierto(true);
      }
    } catch {
      if (pista.imagenUrl) {
        setLightboxFotos([
          {
            id: 0,
            url: pista.imagenUrl,
            publicId: "",
            esPortada: true,
            orden: 0,
            alt: `Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`,
          },
        ]);
        setLightboxIndice(0);
        setLightboxAbierto(true);
      }
    }
  };

  const abrirLightboxSede = (index: number) => {
    setLightboxFotos(
      fotos.map((f, i) => ({
        id: f.id,
        url: f.url,
        publicId: f.publicId,
        alt: `Instalación ${i + 1} del Club Pádel Calatrava`,
      }))
    );
    setLightboxIndice(index);
    setLightboxAbierto(true);
  };

  return (
    <motion.div
      className="space-y-12"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Cabecera */}
      <motion.div variants={fadeUp} className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-card-foreground">
          Club Pádel Calatrava
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Descubre nuestras instalaciones y reserva tu pista. Disponemos
          de pistas de pádel de primer nivel en el corazón de Ciudad Real.
        </p>
      </motion.div>

      {/* Galería de la sede */}
      {fotos.length > 0 && (
        <motion.section variants={fadeUp} className="space-y-4">
          <h2 className="text-2xl font-semibold text-card-foreground">
            Nuestras instalaciones
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fotos.map((foto, index) => (
              <motion.img
                key={foto.id}
                src={foto.url}
                alt={`Instalación ${index + 1} del Club Pádel Calatrava`}
                loading="lazy"
                className="w-full rounded-xl object-cover aspect-video cursor-pointer transition-transform hover:scale-[1.02]"
                variants={fadeUp}
                onClick={() => abrirLightboxSede(index)}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Pistas compactas */}
      {pistas.length > 0 && (
        <motion.section variants={fadeUp} className="space-y-4">
          <h2 className="text-2xl font-semibold text-card-foreground">
            Nuestras pistas
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pistas.map((pista) => (
              <div
                key={pista.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/95 p-3 transition-colors hover:border-white/20"
              >
                {pista.imagenUrl && (
                  <img
                    src={pista.imagenUrl}
                    alt={`Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`}
                    className="h-16 w-16 rounded-lg object-cover shrink-0 cursor-pointer transition-transform hover:scale-105"
                    onClick={() => void abrirLightboxPista(pista)}
                  />
                )}
                <div
                  className="cursor-pointer"
                  onClick={() => void abrirLightboxPista(pista)}
                >
                  <p className="font-semibold text-card-foreground hover:text-primary transition-colors">
                    Pista {pista.numeroPista}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pista.tieneIluminacion
                      ? "Con iluminación"
                      : "Sin iluminación"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* CTA */}
      <motion.div variants={fadeUp} className="text-center">
        <Button
          onClick={() => navigate(isAuthenticated ? "/reservas" : "/login")}
          className="px-8 py-3 text-base"
        >
          Reservar ahora
        </Button>
      </motion.div>

      {/* Lightbox Modal */}
      {lightboxAbierto && (
        <LightboxGaleria
          fotos={lightboxFotos}
          indice={lightboxIndice}
          onCambiarIndice={setLightboxIndice}
          onCerrar={() => setLightboxAbierto(false)}
        />
      )}
    </motion.div>
  );
}
