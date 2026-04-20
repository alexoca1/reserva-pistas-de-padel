import { useEffect, useState } from "react";
import { pistasService } from "../services/api";
import { useAuth } from "../context/AuthContext";
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

const initialForm = {
  numeroPista: "",
  tieneIluminacion: false,
  comentarios: "",
};

export function PistasPage() {
  const { isAdmin } = useAuth();
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pistaEditando, setPistaEditando] = useState(null);
  const [pistaEliminando, setPistaEliminando] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    cargarPistas();
  }, []);

  const cargarPistas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await pistasService.getAll();
      setPistas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error al cargar pistas");
    } finally {
      setLoading(false);
    }
  };

  const abrirNuevaPista = () => {
    if (!isAdmin) {
      setError("No tienes permisos para crear pistas.");
      return;
    }
    setPistaEditando(null);
    setForm(initialForm);
    setOpenFormDialog(true);
  };

  const abrirEditarPista = (pista) => {
    if (!isAdmin) {
      setError("No tienes permisos para editar pistas.");
      return;
    }
    setPistaEditando(pista);
    setForm({
      numeroPista: String(pista.numeroPista ?? ""),
      tieneIluminacion: Boolean(pista.tieneIluminacion),
      comentarios: pista.comentarios || "",
    });
    setOpenFormDialog(true);
  };

  const abrirEliminarPista = (pista) => {
    if (!isAdmin) {
      setError("No tienes permisos para eliminar pistas.");
      return;
    }
    setPistaEliminando(pista);
    setOpenDeleteDialog(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const guardarPista = async (e) => {
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
      };

      if (pistaEditando?.id) {
        await pistasService.update(pistaEditando.id, payload);
      } else {
        await pistasService.create(payload);
      }

      setOpenFormDialog(false);
      setPistaEditando(null);
      setForm(initialForm);
      await cargarPistas();
    } catch (e) {
      setError(e.message || "Error al guardar pista");
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
      setOpenDeleteDialog(false);
      setPistaEliminando(null);
      await cargarPistas();
    } catch (e) {
      setError(e.message || "Error al eliminar pista");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Pistas</h1>
        {isAdmin ? (
          <Button onClick={abrirNuevaPista}>Nueva pista</Button>
        ) : null}
      </div>

     {!isAdmin ? null : null}

      {error ? (
        <p className="rounded-md border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border border-slate-800 bg-slate-900/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número de pista</TableHead>
              <TableHead>Iluminación</TableHead>
              <TableHead>Comentarios</TableHead>
              {isAdmin ? (
                <TableHead className="text-right">Acciones</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && pistas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 4 : 3}
                  className="text-center text-slate-400"
                >
                  Cargando pistas...
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && pistas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 4 : 3}
                  className="text-center text-slate-400"
                >
                  No hay pistas registradas.
                </TableCell>
              </TableRow>
            ) : null}

            {pistas.map((pista) => (
              <TableRow key={pista.id}>
                <TableCell className="font-medium">
                  Pista {pista.numeroPista}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      pista.tieneIluminacion
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-red-500/40 bg-red-500/20 text-red-300"
                    }
                  >
                    {pista.tieneIluminacion ? "Sí" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>{pista.comentarios || "Sin comentarios"}</TableCell>
                {isAdmin ? (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        className="bg-slate-700 text-slate-100 hover:bg-slate-600"
                        onClick={() => abrirEditarPista(pista)}
                      >
                        Editar
                      </Button>
                      <Button
                        className="bg-red-600 text-white hover:bg-red-500"
                        onClick={() => abrirEliminarPista(pista)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openFormDialog && isAdmin} onOpenChange={setOpenFormDialog}>
        <DialogContent>
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

            <div className="flex items-center gap-3 rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
              <input
                id="tieneIluminacion"
                name="tieneIluminacion"
                type="checkbox"
                checked={form.tieneIluminacion}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              <Label htmlFor="tieneIluminacion" className="m-0">
                Tiene iluminación
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                className="bg-slate-700 text-slate-100 hover:bg-slate-600"
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
          <p className="text-sm text-slate-300">
            ¿Seguro que quieres eliminar la pista{" "}
            <strong>{pistaEliminando?.numeroPista || ""}</strong>?
          </p>
          <DialogFooter>
            <Button
              type="button"
              className="bg-slate-700 text-slate-100 hover:bg-slate-600"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={confirmarEliminar}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
