import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
import { motion } from "framer-motion";
import { fadeScale } from "@/lib/motion";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Error al iniciar sesión"));
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
          <CardTitle className="text-center">Iniciar sesión</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                required
                disabled={cargando}
              />
            </div>

            <Button type="submit" disabled={cargando} className="w-full">
              {cargando ? "Cargando..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
             <Link
              to="/register"
              className="font-medium text-primary transition hover:text-accent"
            >
              Regístrate aquí
            </Link>
          </p>
        </CardFooter>
      </Card>
      </motion.div>
    </div>
  );
}