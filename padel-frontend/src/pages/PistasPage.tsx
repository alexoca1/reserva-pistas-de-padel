import { useEffect, useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { pistasService, fotoPistaService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Pista, FotoPista, EstadoPista } from "../types";
import { getErrorMessage } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPlus, IconEdit, IconTrash } from "@/components/icons";
import { LightboxGaleria, type FotoLightbox } from "@/components/LightboxGaleria";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface PistaForm {
  numeroPista: string;
  tieneIluminacion: boolean;
  comentarios: string;
  imagenUrl: string;
  precioHora: string;
  estado: EstadoPista;
}

const initialForm: PistaForm = {
  numeroPista: "",
  tieneIluminacion: false,
  comentarios: "",
  imagenUrl: "",
  precioHora: "20.00",
  estado: "ACTIVA",
};

export function PistasPage() {
  const { isAdmin, isDemoAdmin, isAuthenticated } = useAuth();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pistaEditando, setPistaEditando] = useState<Pista | null>(null);
  const [pistaEliminando, setPistaEliminando] = useState<Pista | null>(null);
  const [form, setForm] = useState<PistaForm>(initialForm);

  // Galería en edición (admin)
  const [fotosPistaEditando, setFotosPistaEditando] = useState<FotoPista[]>([]);
  const [cargandoFotos, setCargandoFotos] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoAEliminarId, setFotoAEliminarId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox (público)
  const [lightboxFotos, setLightboxFotos] = useState<FotoLightbox[]>([]);
  const [lightboxIndice, setLightboxIndice] = useState(0);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);

  const cargarPistas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await pistasService.getAll();
      const lista = Array.isArray(data)
        ? [...data].sort((a, b) => (a.numeroPista ?? 0) - (b.numeroPista ?? 0))
        : [];
      setPistas(lista);
    } catch (e) {
      setError(getErrorMessage(e, "Error al cargar pistas"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarPistas();
  }, []);

  const cargarFotosPista = async (pistaId: number) => {
    try {
      setCargandoFotos(true);
      const data = await fotoPistaService.getAll(pistaId);
      setFotosPistaEditando(Array.isArray(data) ? data : []);
    } catch {
      setFotosPistaEditando([]);
    } finally {
      setCargandoFotos(false);
    }
  };

  const abrirNuevaPista = () => {
    if (!isAdmin) {
      setError("No tienes permisos para crear pistas.");
      return;
    }
    setPistaEditando(null);
    setForm(initialForm);
    setFotosPistaEditando([]);
    setFotoAEliminarId(null);
    setOpenFormDialog(true);
  };

  const abrirEditarPista = (pista: Pista) => {
    if (!isAdmin) {
      setError("No tienes permisos para editar pistas.");
      return;
    }
    setPistaEditando(pista);
    setForm({
      numeroPista: String(pista.numeroPista ?? ""),
      tieneIluminacion: Boolean(pista.tieneIluminacion),
      comentarios: pista.comentarios || "",
      imagenUrl: pista.imagenUrl || "",
      precioHora: pista.precioHora != null ? String(pista.precioHora) : "20.00",
      estado: pista.estado || "ACTIVA",
    });
    setFotoAEliminarId(null);
    setOpenFormDialog(true);
    void cargarFotosPista(pista.id);
  };

  const abrirEliminarPista = (pista: Pista) => {
    if (!isAdmin) {
      setError("No tienes permisos para eliminar pistas.");
      return;
    }
    setPistaEliminando(pista);
    setOpenDeleteDialog(true);
  };

  const abrirLightbox = async (pista: Pista) => {
    try {
      const fotos = await fotoPistaService.getAll(pista.id);
      if (fotos && fotos.length > 0) {
        setLightboxFotos(
          fotos.map((f, i) => ({
            ...f,
            alt: `Foto ${i + 1} de la pista ${pista.numeroPista} — Club Pádel Calatrava`,
          }))
        );
        setLightboxIndice(0);
        setLightboxAbierto(true);
      } else if (pista.imagenUrl) {
        setLightboxFotos([{
          id: 0,
          url: pista.imagenUrl,
          publicId: "",
          esPortada: true,
          orden: 0,
          alt: `Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`,
        }]);
        setLightboxIndice(0);
        setLightboxAbierto(true);
      }
    } catch {
      if (pista.imagenUrl) {
        setLightboxFotos([{
          id: 0,
          url: pista.imagenUrl,
          publicId: "",
          esPortada: true,
          orden: 0,
          alt: `Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`,
        }]);
        setLightboxIndice(0);
        setLightboxAbierto(true);
      }
    }
  };

  const handleSubirFoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pistaEditando?.id) return;

    try {
      setSubiendoFoto(true);
      setError("");
      const nuevaFoto = await fotoPistaService.subir(pistaEditando.id, file);
      if (nuevaFoto) {
        setFotosPistaEditando((prev) => {
          const actualizadas = [...prev, nuevaFoto];
          if (nuevaFoto.esPortada) {
            setForm((f) => ({ ...f, imagenUrl: nuevaFoto.url }));
          }
          return actualizadas;
        });
        mostrarToast("Foto subida correctamente");
        await cargarPistas();
      }
    } catch (err) {
      setError(getErrorMessage(err, "Error al subir la foto"));
    } finally {
      setSubiendoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSetPortada = async (fotoId: number) => {
    if (!pistaEditando?.id) return;
    try {
      await fotoPistaService.setPortada(pistaEditando.id, fotoId);
      const portadaFoto = fotosPistaEditando.find((f) => f.id === fotoId);
      setFotosPistaEditando((prev) =>
        prev.map((f) => ({ ...f, esPortada: f.id === fotoId }))
      );
      if (portadaFoto) {
        setForm((prev) => ({ ...prev, imagenUrl: portadaFoto.url }));
      }
      mostrarToast("Portada actualizada");
      await cargarPistas();
    } catch (err) {
      setError(getErrorMessage(err, "Error al cambiar portada"));
    }
  };

  const handleEliminarFoto = async (fotoId: number) => {
    if (!pistaEditando?.id) return;
    try {
      await fotoPistaService.eliminar(pistaEditando.id, fotoId);
      setFotosPistaEditando((prev) => {
        const restantes = prev.filter((f) => f.id !== fotoId);
        const nuevaPortada = restantes.find((f) => f.esPortada) || restantes[0];
        setForm((f) => ({ ...f, imagenUrl: nuevaPortada ? nuevaPortada.url : "" }));
        return restantes;
      });
      setFotoAEliminarId(null);
      mostrarToast("Foto eliminada");
      await cargarPistas();
    } catch (err) {
      setError(getErrorMessage(err, "Error al eliminar la foto"));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const guardarPista = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAdmin) {
      setError("No tienes permisos para guardar pistas.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        numeroPista: Number(form.numeroPista),
        tieneIluminacion: form.tieneIluminacion,
        comentarios: form.comentarios,
        imagenUrl: form.imagenUrl,
        precioHora: Number(form.precioHora) || 20.0,
        estado: form.estado,
      };

      if (pistaEditando?.id) {
        await pistasService.update(pistaEditando.id, payload);
        mostrarToast("Pista actualizada");
      } else {
        await pistasService.create(payload);
        mostrarToast("Pista creada");
      }

      setOpenFormDialog(false);
      setPistaEditando(null);
      setForm(initialForm);
      await cargarPistas();
    } catch (e) {
      setError(getErrorMessage(e, "Error al guardar pista"));
      setLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!pistaEliminando?.id) return;
    if (!isAdmin) {
      setError("No tienes permisos para eliminar pistas.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await pistasService.delete(pistaEliminando.id);
      mostrarToast("Pista eliminada");
      setOpenDeleteDialog(false);
      setPistaEliminando(null);
      await cargarPistas();
    } catch (e) {
      setError(getErrorMessage(e, "Error al eliminar pista"));
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between gap-4"
      >
        <h1 className="text-2xl font-bold text-foreground">Pistas</h1>
        {isAdmin ? (
          isDemoAdmin ? (
            <span className="text-xs italic text-muted-foreground self-center">
              No disponible en demo
            </span>
          ) : (
            <Button onClick={abrirNuevaPista}>
              <IconPlus className="h-4 w-4" />
              Nueva pista
            </Button>
          )
        ) : null}
      </motion.div>

      {!isAuthenticated ? (
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground backdrop-blur-xl"
        >
          <span>
            Consulta nuestras pistas disponibles. Inicia sesión para realizar una reserva.
          </span>
          <Button variant="outline" onClick={() => navigate("/login")}>
            Iniciar sesión
          </Button>
        </motion.div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading && pistas.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-muted-foreground backdrop-blur-xl">
          Cargando pistas...
        </p>
      ) : null}

      {!loading && pistas.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-muted-foreground backdrop-blur-xl">
          No hay pistas registradas.
        </p>
      ) : null}

      {pistas.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-4 md:hidden"
        >
          {pistas.map((pista) => (
            <motion.div
              key={pista.id}
              variants={fadeUp}
              className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {pista.imagenUrl ? (
                    <img
                      src={pista.imagenUrl}
                      alt={`Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`}
                      className="h-12 w-12 object-cover rounded cursor-pointer transition-transform hover:scale-105"
                      onClick={() => void abrirLightbox(pista)}
                    />
                  ) : null}
                  <div>
                    <p className="font-medium text-foreground">
                      Pista {pista.numeroPista}
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      {Number(pista.precioHora ?? 20).toFixed(2)} €/h
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={pista.estado === "MANTENIMIENTO" ? "danger" : "success"}>
                    {pista.estado === "MANTENIMIENTO" ? "Mantenimiento" : "Activa"}
                  </Badge>
                  <Badge variant={pista.tieneIluminacion ? "success" : "danger"}>
                    {pista.tieneIluminacion ? "Luz: Sí" : "Luz: No"}
                  </Badge>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {pista.comentarios || "Sin comentarios"}
              </p>
              {isAdmin ? (
                isDemoAdmin ? (
                  <div className="mt-4 flex justify-center border-t border-white/10 pt-3">
                    <span className="text-xs italic text-muted-foreground">
                      No disponible en demo
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => abrirEditarPista(pista)}
                    >
                      <IconEdit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => abrirEliminarPista(pista)}
                    >
                      <IconTrash className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                )
              ) : (
                <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={pista.estado === "MANTENIMIENTO"}
                    title={pista.estado === "MANTENIMIENTO" ? "Pista actualmente en mantenimiento" : undefined}
                    onClick={() =>
                      navigate(
                        isAuthenticated ? "/reservas" : "/login",
                        isAuthenticated ? { state: { pistaId: pista.id } } : undefined
                      )
                    }
                  >
                    {pista.estado === "MANTENIMIENTO" ? "En mantenimiento" : "Reservar"}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : null}

      {pistas.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl md:block"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de pista</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio / hora</TableHead>
                <TableHead>Iluminación</TableHead>
                <TableHead>Comentarios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pistas.map((pista) => (
                <TableRow key={pista.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {pista.imagenUrl ? (
                        <img
                          src={pista.imagenUrl}
                          alt={`Pista ${pista.numeroPista} de pádel — Club Pádel Calatrava`}
                          className="h-16 w-16 object-cover rounded cursor-pointer transition-transform hover:scale-105"
                          onClick={() => void abrirLightbox(pista)}
                        />
                      ) : null}
                      <span>Pista {pista.numeroPista}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pista.estado === "MANTENIMIENTO" ? "danger" : "success"}>
                      {pista.estado === "MANTENIMIENTO" ? "Mantenimiento" : "Activa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {Number(pista.precioHora ?? 20).toFixed(2)} €/h
                  </TableCell>
                  <TableCell>
                    <Badge variant={pista.tieneIluminacion ? "success" : "danger"}>
                      {pista.tieneIluminacion ? "Sí" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{pista.comentarios || "Sin comentarios"}</TableCell>
                  <TableCell className="text-right">
                    {isAdmin ? (
                      isDemoAdmin ? (
                        <div className="flex justify-end">
                          <span className="text-xs italic text-muted-foreground">
                            No disponible en demo
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => abrirEditarPista(pista)}
                          >
                            <IconEdit className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => abrirEliminarPista(pista)}
                          >
                            <IconTrash className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      )
                    ) : (
                      <Button
                        variant="secondary"
                        disabled={pista.estado === "MANTENIMIENTO"}
                        title={pista.estado === "MANTENIMIENTO" ? "Pista actualmente en mantenimiento" : undefined}
                        onClick={() =>
                          navigate(
                            isAuthenticated ? "/reservas" : "/login",
                            isAuthenticated ? { state: { pistaId: pista.id } } : undefined
                          )
                        }
                      >
                        {pista.estado === "MANTENIMIENTO" ? "En mantenimiento" : "Reservar"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      ) : null}

      <Dialog open={openFormDialog && isAdmin} onOpenChange={setOpenFormDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {pistaEditando ? "Editar pista" : "Nueva pista"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={guardarPista}>
            <div className="grid gap-2">
              <Label htmlFor="numeroPista">Número de pista</Label>
              <Input
                id="numeroPista"
                name="numeroPista"
                type="number"
                min="1"
                value={form.numeroPista}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comentarios">Comentarios</Label>
              <Input
                id="comentarios"
                name="comentarios"
                type="text"
                placeholder="Detalles de la pista"
                value={form.comentarios}
                onChange={handleChange}
              />
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="precioHora">Precio por hora (€)</Label>
                <Input
                  id="precioHora"
                  name="precioHora"
                  type="number"
                  min="0"
                  step="0.50"
                  value={form.precioHora}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estado">Estado operativo</Label>
                <select
                  id="estado"
                  name="estado"
                  value={form.estado}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      estado: e.target.value as EstadoPista,
                    }))
                  }
                  className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ACTIVA" className="bg-card text-foreground">
                    Activa
                  </option>
                  <option value="MANTENIMIENTO" className="bg-card text-foreground">
                    Mantenimiento
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2">
              <input
                id="tieneIluminacion"
                name="tieneIluminacion"
                type="checkbox"
                checked={form.tieneIluminacion}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/20 bg-black/20 accent-primary focus:ring-2 focus:ring-ring/40"
              />
              <Label htmlFor="tieneIluminacion" className="m-0">
                Tiene iluminación
              </Label>
            </div>

            {/* Gestión de Galería de fotos (T14 - T15) */}
            {pistaEditando ? (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Galería de fotos ({fotosPistaEditando.length}/5)
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSubirFoto}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={fotosPistaEditando.length >= 5 || subiendoFoto}
                    title={fotosPistaEditando.length >= 5 ? "Máximo 5 fotos alcanzado" : undefined}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {subiendoFoto ? "Subiendo..." : "Subir foto"}
                  </Button>
                </div>

                {cargandoFotos ? (
                  <p className="text-xs text-muted-foreground">Cargando fotos...</p>
                ) : fotosPistaEditando.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No hay fotos en la galería de esta pista. Sube hasta 5 fotos.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {fotosPistaEditando.map((foto, index) => (
                      <div
                        key={foto.id}
                        className="group relative flex flex-col items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 p-1"
                      >
                        <img
                          src={foto.url}
                          alt={`Foto ${index + 1} de la pista ${pistaEditando?.numeroPista ?? ""} — Club Pádel Calatrava`}
                          className="h-20 w-full rounded object-cover"
                        />
                        {foto.esPortada ? (
                          <span className="absolute left-2 top-2 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold text-black">
                            PORTADA
                          </span>
                        ) : null}

                        <div className="mt-1.5 flex w-full items-center justify-between gap-1">
                          <Button
                            type="button"
                            variant={foto.esPortada ? "primary" : "secondary"}
                            className={`h-7 px-2 text-xs ${foto.esPortada ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
                            onClick={() => !foto.esPortada && handleSetPortada(foto.id)}
                            title={foto.esPortada ? "Foto de portada" : "Establecer como portada"}
                          >
                            ⭐
                          </Button>

                          {fotoAEliminarId === foto.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="destructive"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleEliminarFoto(foto.id)}
                              >
                                Sí
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                className="h-7 px-2 text-xs"
                                onClick={() => setFotoAEliminarId(null)}
                              >
                                No
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="destructive"
                              className="h-7 px-2 text-xs"
                              onClick={() => setFotoAEliminarId(foto.id)}
                              title="Eliminar foto"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpenFormDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {pistaEditando ? "Guardar cambios" : "Crear pista"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDeleteDialog && isAdmin}
        onOpenChange={setOpenDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar pista</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-foreground">
            ¿Seguro que quieres eliminar la pista{" "}
            <strong>{pistaEliminando?.numeroPista || ""}</strong>?
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmarEliminar()}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox de galería (T10, T13) */}
      {lightboxAbierto ? (
        <LightboxGaleria
          fotos={lightboxFotos}
          indice={lightboxIndice}
          onCambiarIndice={setLightboxIndice}
          onCerrar={() => setLightboxAbierto(false)}
        />
      ) : null}
    </motion.div>
  );
}
