import { useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reservasService } from "../services/api";
import type { ValidacionQR } from "../types";
import { getErrorMessage } from "../types";

function TarjetaValidacionQR({ resultado }: { resultado: ValidacionQR }) {
  const esCancelada = resultado.estado === "CANCELADA";

  return (
    <Card className={esCancelada ? "border-destructive/60 bg-destructive/5" : "border-primary/60 bg-primary/5"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pista {resultado.numeroPista}</CardTitle>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              esCancelada
                ? "border border-destructive/40 bg-destructive/10 text-destructive"
                : "border border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
            }`}
          >
            {resultado.estado}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Código: </span>
            <span className="font-mono">{resultado.codigoReserva}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Jugador: </span>
            <span>{resultado.nombreJugador}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Teléfono: </span>
            <span>{resultado.telefono}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Fecha: </span>
            <span>{resultado.fechaReserva}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Horario: </span>
            <span>{resultado.horaInicio} – {resultado.horaFin}</span>
          </div>
          {resultado.costeEstimado != null && (
            <div>
              <span className="font-medium text-foreground">Coste estimado: </span>
              <span>{Number(resultado.costeEstimado).toFixed(2)} €</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ValidarQRPage() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<ValidacionQR | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagenError, setImagenError] = useState("");

  const validar = async (codigoAValidar?: string) => {
    const cod = (codigoAValidar ?? codigo).trim();
    if (!cod) return;

    setError("");
    setResultado(null);
    setLoading(true);
    try {
      const data = await reservasService.validarQR(cod);
      if (!data) {
        setError("No se encontró ninguna reserva con ese código.");
        return;
      }
      setResultado(data);
    } catch (e) {
      const msg = getErrorMessage(e, "Error al validar el código");
      setError(
        msg.includes("404") || msg.includes("encontr")
          ? "No se encontró ninguna reserva con ese código."
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const escanearImagen = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.src = src;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const jsQR = (await import("jsqr")).default;
        const result = jsQR(imageData.data, img.width, img.height);
        if (result?.data) {
          setCodigo(result.data);
          void validar(result.data); // re-usa la función con el nuevo código
        } else {
          setImagenError("No se detectó ningún código QR en la imagen.");
        }
      };
    };
    reader.readAsDataURL(file);
    // Limpiar el input para permitir re-escanear el mismo archivo
    e.target.value = "";
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Validar acceso por QR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Entrada manual */}
          <div className="flex gap-2">
            <Input
              placeholder="RES-20261010-001"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && void validar()}
              className="font-mono"
            />
            <Button onClick={() => void validar()} disabled={loading || !codigo.trim()}>
              {loading ? "Validando..." : "Validar"}
            </Button>
          </div>

          {/* Escanear desde imagen */}
          <div>
            <label
              className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground
                         hover:text-foreground transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => void escanearImagen(e)}
              />
              <span
                className="rounded-md border border-border/50 bg-muted/20 px-3 py-1.5
                           text-xs font-medium hover:bg-muted/40 transition-colors"
              >
                📷 Escanear QR desde cámara
              </span>
            </label>
            {imagenError && (
              <p className="mt-1 text-xs text-destructive">{imagenError}</p>
            )}
            {/* ponytail: usar html5-qrcode con streaming si se necesita
                escaneo en tiempo real sin capturar foto */}
          </div>

          {/* Error */}
          {error && (
            <p
              className="rounded-md border border-destructive/40 bg-destructive/10
                         px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {/* Resultado */}
          {resultado && <TarjetaValidacionQR resultado={resultado} />}
        </CardContent>
      </Card>
    </motion.div>
  );
}
