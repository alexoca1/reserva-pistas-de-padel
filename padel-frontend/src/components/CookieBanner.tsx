import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("cookie_consent", "accepted");
    } catch {
      // Ignorar fallo de almacenamiento
    }
    setVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem("cookie_consent", "rejected");
    } catch {
      // Ignorar fallo de almacenamiento
    }
    setVisible(false);
  };

  const handleViewPolicy = () => {
    navigate("/privacidad");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label="Aviso de cookies"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-background/85 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              🍪 Usamos cookies técnicas necesarias para el funcionamiento de la aplicación. No usamos cookies de seguimiento ni publicidad.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                onClick={handleViewPolicy}
                className="text-xs px-3 py-1.5"
              >
                Ver política
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                className="text-xs px-3 py-1.5"
              >
                Rechazar
              </Button>
              <Button
                variant="primary"
                onClick={handleAccept}
                className="text-xs px-3 py-1.5"
              >
                Aceptar
              </Button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
