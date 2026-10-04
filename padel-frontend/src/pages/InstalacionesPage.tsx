import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { fotoSedeService } from "../services/api";
import { pistasService } from "../services/api";
import type { FotoSede, Pista } from "../types";

export function InstalacionesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fotos, setFotos] = useState<FotoSede[]>([]);
  const [pistas, setPistas] = useState<Pista[]>([]);

  useEffect(() => {
    fotoSedeService.getAll().then((data) => setFotos(data ?? [])).catch(() => {});
    pistasService.getAll().then((data) => setPistas(data ?? [])).catch(() => {});
  }, []);

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
                className="w-full rounded-xl object-cover aspect-video"
                variants={fadeUp}
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
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/95 p-3"
              >
                {pista.imagenUrl && (
                  <img
                    src={pista.imagenUrl}
                    alt={`Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`}
                    className="h-16 w-16 rounded-lg object-cover shrink-0"
                  />
                )}
                <div>
                  <p className="font-semibold text-card-foreground">
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
    </motion.div>
  );
}
