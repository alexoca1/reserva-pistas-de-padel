import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "../types";
import { API_BASE_URL } from "../services/api";
import { motion } from "framer-motion";
import { fadeScale } from "@/lib/motion";

export function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!nombre || !apellidos || !email || !telefono || !password || !confirmPassword) {
      setError("Todos los campos son requeridos");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellidos,
          email,
          telefono,
          password,
        }),
      });

      if (!respuesta.ok) {
        let mensaje = "Error al registrarse";
        try {
          const datos = (await respuesta.json()) as Record<string, unknown>;
          if (typeof datos?.password === "string") {
            mensaje = datos.password;
          } else if (typeof datos?.message === "string") {
            mensaje = datos.message;
          } else if (typeof datos?.error === "string") {
            mensaje = datos.error;
          } else {
            const firstError = Object.values(datos)[0];
            if (typeof firstError === "string") mensaje = firstError;
          }
        } catch {
          // Ignorar
        }
        throw new Error(mensaje);
      }

      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Error al registrarse"));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div initial="hidden" animate="visible" variants={fadeScale} className="w-full max-w-md">
      <Card className="w-full max-w-md">
        
        <CardHeader>
          <div className="mb-2 flex items-center justify-center gap-2">
            <img src="/favicon.svg" alt="Logo Pádel Reservas" className="h-9 w-9 rounded-lg" />
            <span className="text-lg font-semibold text-foreground">Pádel</span>
          </div>
          <CardTitle className="text-center">Crear cuenta</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={cargando}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                type="text"
                placeholder="García López"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                disabled={cargando}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={cargando}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="text"
                placeholder="600123123"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={cargando}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={cargando}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={cargando}
              />
            </div>

            <Button type="submit" disabled={cargando} className="w-full">
              {cargando ? "Cargando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
               <Link
              to="/login"
              className="font-medium text-primary transition hover:text-accent"
            >
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
         </motion.div>
    </div>
  );
}