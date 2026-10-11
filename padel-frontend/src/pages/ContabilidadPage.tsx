import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "../services/api";
import type { ContabilidadResumen } from "../types";
import { getErrorMessage } from "../types";

export function ContabilidadPage() {
  const hoy = new Date();
  const hace30 = new Date(hoy);
  hace30.setDate(hoy.getDate() - 30);
  const formatFecha = (d: Date) => d.toISOString().split("T")[0];

  const [desde, setDesde] = useState(formatFecha(hace30));
  const [hasta, setHasta] = useState(formatFecha(hoy));
  const [resumen, setResumen] = useState<ContabilidadResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [descargando, setDescargando] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getContabilidad(desde, hasta);
      setResumen(data);
    } catch (e) {
      setError(getErrorMessage(e, "Error al cargar la contabilidad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const handleExportar = async () => {
    try {
      setDescargando(true);
      await adminService.descargarCSV(desde, hasta);
    } catch (e) {
      setError(getErrorMessage(e, "Error al descargar el CSV"));
    } finally {
      setDescargando(false);
    }
  };

  const getTasaColor = (tasa: number) => {
    if (tasa < 10) return "text-green-500 dark:text-green-400";
    if (tasa <= 25) return "text-amber-500 dark:text-amber-400";
    return "text-destructive";
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Contabilidad</h1>
        <Button
          onClick={() => void handleExportar()}
          disabled={descargando || loading}
          variant="outline"
          className="border-primary/40 hover:bg-primary/10"
        >
          {descargando ? "Exportando..." : "Exportar CSV"}
        </Button>
      </motion.div>

      {/* Selector de periodo */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Desde</label>
                <Input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Hasta</label>
                <Input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                />
              </div>
              <Button onClick={() => void cargar()} disabled={loading} className="sm:w-auto">
                {loading ? "Cargando..." : "Aplicar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.p
          variants={fadeUp}
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}

      {loading && !resumen ? (
        <motion.p variants={fadeUp} className="py-8 text-center text-muted-foreground">
          Cargando datos contables...
        </motion.p>
      ) : resumen ? (
        <>
          {/* Grid 2x2 de KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ingresos brutos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {Number(resumen.ingresosBrutos).toFixed(2)} €
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Reembolsos emitidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                    {Number(resumen.reembolsosEmitidos).toFixed(2)} €
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ingresos netos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500 dark:text-green-400">
                    {Number(resumen.ingresosNetos).toFixed(2)} €
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tasa de cancelación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getTasaColor(resumen.tasaCancelacion)}`}>
                    {Number(resumen.tasaCancelacion).toFixed(1)} %
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Fila de datos secundarios */}
          <motion.div variants={fadeUp} className="text-sm text-muted-foreground">
            {resumen.reservasConfirmadas} reservas confirmadas · {resumen.reservasCanceladas} canceladas
          </motion.div>

          {/* Aviso al pie */}
          <motion.p variants={fadeUp} className="text-xs italic text-muted-foreground">
            Los importes son simulados y no corresponden a transacciones reales.
          </motion.p>
        </>
      ) : null}
    </motion.div>
  );
}
