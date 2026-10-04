import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "../context/ToastContext";
import { fotoSedeService } from "../services/api";
import { getErrorMessage } from "../types";
import type { FotoSede } from "../types";

const MAX_FOTOS = 10;

export function GaleriaSedeAdmin() {
  const { mostrarToast } = useToast();
  const [fotos, setFotos] = useState<FotoSede[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [fotoAEliminar, setFotoAEliminar] = useState<FotoSede | null>(null);
  const [errorDelete, setErrorDelete] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let activo = true;
    fotoSedeService
      .getAll()
      .then((data) => {
        if (activo) {
          setFotos(data ?? []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (activo) {
          setLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const seleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoSeleccionado(file);
    setPreview(URL.createObjectURL(file));
  };

  const cancelarSubida = () => {
    setPreview(null);
    setArchivoSeleccionado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmarSubida = async () => {
    if (!archivoSeleccionado) return;
    try {
      setSubiendo(true);
      const nueva = await fotoSedeService.subir(archivoSeleccionado);
      if (nueva) {
        setFotos((prev) => [...prev, nueva]);
      }
      cancelarSubida();
      mostrarToast("Foto añadida a la galería de la sede");
    } catch (e) {
      mostrarToast(getErrorMessage(e, "Error al subir la foto"));
    } finally {
      setSubiendo(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!fotoAEliminar) return;
    try {
      await fotoSedeService.eliminar(fotoAEliminar.id);
      setFotos((prev) => prev.filter((f) => f.id !== fotoAEliminar.id));
      setOpenDelete(false);
      setFotoAEliminar(null);
      mostrarToast("Foto eliminada de la galería de la sede");
    } catch (e) {
      setErrorDelete(getErrorMessage(e, "Error al eliminar la foto"));
    }
  };

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold">Galería de la sede</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona las fotos oficiales de las instalaciones que ven los usuarios.
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-medium px-2.5 py-1 rounded-full bg-secondary">
            {fotos.length} / {MAX_FOTOS} fotos
          </span>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de foto */}
          <div className="space-y-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={seleccionarArchivo}
                disabled={fotos.length >= MAX_FOTOS}
              />
              <Button
                type="button"
                variant="outline"
                disabled={fotos.length >= MAX_FOTOS || subiendo}
                title={
                  fotos.length >= MAX_FOTOS
                    ? "Máximo de 10 fotos alcanzado"
                    : undefined
                }
                onClick={() => fileInputRef.current?.click()}
              >
                Subir foto de la sede
              </Button>
            </div>

            {preview && (
              <div className="space-y-3 p-3 rounded-lg border border-border bg-card/60 backdrop-blur-sm max-w-md">
                <p className="text-xs font-medium text-foreground">Vista previa:</p>
                <img
                  src={preview}
                  alt="Vista previa de foto de la sede — Club Pádel Calatrava"
                  className="h-36 w-full rounded-lg object-cover aspect-video"
                />
                <div className="flex gap-2">
                  <Button onClick={confirmarSubida} disabled={subiendo}>
                    {subiendo ? "Subiendo a Cloudinary..." : "Confirmar subida"}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={subiendo}
                    onClick={cancelarSubida}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Grid de fotos */}
          {loading ? (
            <p className="text-muted-foreground py-4 text-center">Cargando fotos de la sede...</p>
          ) : fotos.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              No hay fotos de la sede. Sube la primera foto para mostrarla en las instalaciones.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {fotos.map((foto, index) => (
                <div key={foto.id} className="group relative overflow-hidden rounded-lg border border-white/10 shadow-sm">
                  <img
                    src={foto.url}
                    alt={`Instalación ${index + 1} del Club Pádel Calatrava`}
                    className="w-full rounded-lg object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    aria-label="Eliminar foto de la sede"
                    onClick={() => {
                      setFotoAEliminar(foto);
                      setErrorDelete("");
                      setOpenDelete(true);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-destructive/90 hover:bg-destructive p-1.5 text-white opacity-0 transition group-hover:opacity-100 shadow-md focus:opacity-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación de borrado */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar foto de la sede</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            ¿Seguro que quieres eliminar esta foto de la sede? Esta acción no se puede deshacer.
          </p>
          {errorDelete && (
            <p className="text-sm text-destructive">{errorDelete}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEliminar}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
