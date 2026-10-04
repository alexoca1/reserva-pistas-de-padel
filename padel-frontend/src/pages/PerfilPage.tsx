import { useEffect, useState, useId, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { perfilService, usuariosService } from "../services/api";
import type { Usuario, PerfilPayload } from "../types";
import { getErrorMessage } from "../types";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/Avatar";
import { BuscadorJugador } from "@/components/BuscadorJugador";
import { IconEdit, IconLock } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function PerfilPage() {
  const { user, isAdmin, actualizarUsuario, logout } = useAuth();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const jugadorSelectId = useId();

  // Estado avatar
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [archivoAvatar, setArchivoAvatar] = useState<File | null>(null);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [errorAvatar, setErrorAvatar] = useState("");
  const inputAvatarRef = useRef<HTMLInputElement>(null);

  const seleccionarAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoAvatar(file);
    setPreviewAvatar(URL.createObjectURL(file));
    setErrorAvatar("");
  };

  const confirmarAvatar = async () => {
    if (!archivoAvatar) return;
    try {
      setSubiendoAvatar(true);
      setErrorAvatar("");
      const resultado = await perfilService.subirAvatar(archivoAvatar);
      actualizarUsuario({ avatarUrl: resultado.avatarUrl });
      setPreviewAvatar(null);
      setArchivoAvatar(null);
      if (inputAvatarRef.current) {
        inputAvatarRef.current.value = "";
      }
      mostrarToast("Foto de perfil actualizada");
    } catch (e) {
      setErrorAvatar(getErrorMessage(e, "Error al actualizar la foto de perfil"));
    } finally {
      setSubiendoAvatar(false);
    }
  };

  // Modo edición del perfil propio
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);

  // Estado RGPD (Portabilidad y Supresión)
  const [descargandoDatos, setDescargandoDatos] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState("");
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  const handleDescargarDatos = async () => {
    try {
      setDescargandoDatos(true);
      const data = await perfilService.getMisDatos();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mis-datos-padel-reservas.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      mostrarToast("Datos exportados correctamente");
    } catch (e) {
      mostrarToast(getErrorMessage(e, "Error al exportar datos"));
    } finally {
      setDescargandoDatos(false);
    }
  };

  const handleConfirmarEliminarCuenta = async () => {
    if (textoConfirmacion !== "ELIMINAR") return;
    try {
      setEliminandoCuenta(true);
      setErrorEliminar("");
      await perfilService.eliminarCuenta();
      setOpenDeleteModal(false);
      await logout();
      navigate("/");
      mostrarToast("Tu cuenta ha sido eliminada correctamente");
    } catch (e) {
      setErrorEliminar(getErrorMessage(e, "Error al eliminar la cuenta"));
    } finally {
      setEliminandoCuenta(false);
    }
  };

  // Estado formulario propio
  const [formPropio, setFormPropio] = useState({
    nombre: user?.nombre || "",
    apellidos: user?.apellidos || "",
    telefono: user?.telefono || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [guardandoPropio, setGuardandoPropio] = useState(false);
  const [errorPropio, setErrorPropio] = useState("");

  // Sincronizar datos propios cuando cargue o cambie el usuario en AuthContext
  useEffect(() => {
    if (user) {
      setFormPropio({
        nombre: user.nombre || "",
        apellidos: user.apellidos || "",
        telefono: user.telefono || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const cancelarEdicionPropia = () => {
    setModoEdicion(false);
    setMostrarCambioPassword(false);
    setErrorPropio("");
    if (user) {
      setFormPropio({
        nombre: user.nombre || "",
        apellidos: user.apellidos || "",
        telefono: user.telefono || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handleGuardarPropio = async (e: FormEvent) => {
    e.preventDefault();
    setErrorPropio("");

    if (mostrarCambioPassword || formPropio.newPassword || formPropio.currentPassword || formPropio.confirmPassword) {
      if (!formPropio.currentPassword) {
        setErrorPropio("Debes ingresar tu contraseña actual para cambiarla.");
        return;
      }
      if (!formPropio.newPassword || formPropio.newPassword.length < 6) {
        setErrorPropio("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (formPropio.newPassword !== formPropio.confirmPassword) {
        setErrorPropio("La nueva contraseña y su confirmación no coinciden.");
        return;
      }
    }

    setGuardandoPropio(true);

    try {
      const payload: PerfilPayload = {
        nombre: formPropio.nombre,
        apellidos: formPropio.apellidos,
        telefono: formPropio.telefono,
        email: formPropio.email,
      };
      if (formPropio.newPassword) {
        payload.password = formPropio.newPassword;
        payload.currentPassword = formPropio.currentPassword;
      }

      const resp = await perfilService.actualizar(payload);

      if (resp) {
        actualizarUsuario(resp);
        setFormPropio((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setModoEdicion(false);
        setMostrarCambioPassword(false);
      }
      mostrarToast("Perfil actualizado correctamente");
    } catch (err) {
      setErrorPropio(getErrorMessage(err, "Error al actualizar el perfil"));
    } finally {
      setGuardandoPropio(false);
    }
  };

  // Estado sección admin
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<number | null>(null);
  const [formJugador, setFormJugador] = useState({
    nombre: "",
    apellidos: "",
    telefono: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [guardandoJugador, setGuardandoJugador] = useState(false);
  const [errorJugador, setErrorJugador] = useState("");

  // Carga de usuarios para admin (excluyendo al propio admin)
  useEffect(() => {
    if (isAdmin && usuarios.length === 0) {
      usuariosService
        .getAll()
        .then((data) => {
          const lista = Array.isArray(data) ? data : [];
          setUsuarios(lista.filter((u) => u.id !== user?.id));
        })
        .catch(() => {
          // Error no bloqueante
        });
    }
  }, [isAdmin, user?.id, usuarios.length]);

  const handleSeleccionarJugador = (id: number | null) => {
    setUsuarioSeleccionadoId(id);
    setErrorJugador("");

    if (id !== null) {
      const u = usuarios.find((item) => item.id === id);
      if (u) {
        setFormJugador({
          nombre: u.nombre || "",
          apellidos: u.apellidos || "",
          telefono: u.telefono || "",
          email: u.email || "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } else {
      setFormJugador({ nombre: "", apellidos: "", telefono: "", email: "", newPassword: "", confirmPassword: "" });
    }
  };

  const handleGuardarJugador = async (e: FormEvent) => {
    e.preventDefault();
    if (usuarioSeleccionadoId === null) return;

    setErrorJugador("");

    if (formJugador.newPassword || formJugador.confirmPassword) {
      if (formJugador.newPassword.length < 6) {
        setErrorJugador("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (formJugador.newPassword !== formJugador.confirmPassword) {
        setErrorJugador("La nueva contraseña y su confirmación no coinciden.");
        return;
      }
    }

    setGuardandoJugador(true);

    try {
      const payload: PerfilPayload = {
        nombre: formJugador.nombre,
        apellidos: formJugador.apellidos,
        telefono: formJugador.telefono,
        email: formJugador.email,
        usuarioId: usuarioSeleccionadoId,
      };
      if (formJugador.newPassword) {
        payload.password = formJugador.newPassword;
      }

      const resp = await perfilService.actualizar(payload);

      if (resp) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === resp.id ? { ...u, ...resp } : u))
        );
        setFormJugador((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
        const nombreJugador = `${resp.nombre || ""} ${resp.apellidos || ""}`.trim() || "jugador";
        mostrarToast(`Datos de ${nombreJugador} actualizados`);
      }
    } catch (err) {
      setErrorJugador(getErrorMessage(err, "Error al actualizar datos del jugador"));
    } finally {
      setGuardandoJugador(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl space-y-8"
    >
      <motion.div variants={fadeUp} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          Perfil de Usuario
        </h1>
        <p className="text-muted-foreground">
          Consulta y gestiona tus datos personales de acceso y contacto.
        </p>
      </motion.div>

      {/* Sección 1: Mis datos */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Mis datos personales</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {modoEdicion
                    ? "Modifica tus datos o cambia tu contraseña."
                    : "Consulta la información de tu cuenta."}
                </p>
              </div>

              {!modoEdicion ? (
                <Button onClick={() => setModoEdicion(true)} className="gap-2">
                  <IconEdit className="h-4 w-4" />
                  Editar perfil
                </Button>
              ) : (
                <Button variant="outline" onClick={cancelarEdicionPropia}>
                  Cancelar
                </Button>
              )}
            </CardHeader>

            <CardContent>
              {/* Avatar clicable con preview */}
              <div className="mb-6 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => inputAvatarRef.current?.click()}
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Cambiar foto de perfil"
                >
                  <Avatar
                    url={previewAvatar ?? user?.avatarUrl}
                    nombre={user?.nombre}
                    apellidos={user?.apellidos}
                    id={user?.id}
                    size={80}
                  />
                </button>
                <input
                  ref={inputAvatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={seleccionarAvatar}
                />
                {previewAvatar && (
                  <div className="flex gap-2">
                    <Button
                      onClick={confirmarAvatar}
                      disabled={subiendoAvatar}
                      className="text-sm"
                    >
                      {subiendoAvatar ? "Guardando..." : "Guardar foto"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPreviewAvatar(null);
                        setArchivoAvatar(null);
                        if (inputAvatarRef.current) {
                          inputAvatarRef.current.value = "";
                        }
                      }}
                      className="text-sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
                {errorAvatar && (
                  <p className="text-xs text-destructive">{errorAvatar}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Clic en la foto para cambiarla
                </p>
              </div>

              {errorPropio ? (
                <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorPropio}
                </p>
              ) : null}

              {!modoEdicion ? (
                /* Modo Lectura / Muestra de Datos */
                <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Nombre completo
                      </p>
                      <p className="mt-1 text-base font-medium text-foreground">
                        {user?.nombre} {user?.apellidos}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Correo electrónico
                      </p>
                      <p className="mt-1 text-base font-medium text-foreground">
                        {user?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Teléfono de contacto
                      </p>
                      <p className="mt-1 text-base font-medium text-foreground">
                        {user?.telefono || "No especificado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Rol en el sistema
                      </p>
                      <span className="mt-1 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {isAdmin ? "Administrador" : "Jugador"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Modo Edición de Formulario */
                <form onSubmit={handleGuardarPropio} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="my-nombre">Nombre</Label>
                      <Input
                        id="my-nombre"
                        type="text"
                        value={formPropio.nombre}
                        onChange={(e) =>
                          setFormPropio((prev) => ({ ...prev, nombre: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="my-apellidos">Apellidos</Label>
                      <Input
                        id="my-apellidos"
                        type="text"
                        value={formPropio.apellidos}
                        onChange={(e) =>
                          setFormPropio((prev) => ({ ...prev, apellidos: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="my-email">Correo electrónico</Label>
                      <Input
                        id="my-email"
                        type="email"
                        value={formPropio.email}
                        onChange={(e) =>
                          setFormPropio((prev) => ({ ...prev, email: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="my-telefono">Teléfono de contacto</Label>
                      <Input
                        id="my-telefono"
                        type="text"
                        placeholder="Ej: 600123123"
                        value={formPropio.telefono}
                        onChange={(e) =>
                          setFormPropio((prev) => ({ ...prev, telefono: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {/* Sección Desplegable de Cambio de Contraseña */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconLock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          Cambiar contraseña
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-xs text-primary hover:text-primary/80"
                        onClick={() => {
                          setMostrarCambioPassword(!mostrarCambioPassword);
                          if (mostrarCambioPassword) {
                            setFormPropio((prev) => ({
                              ...prev,
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            }));
                          }
                        }}
                      >
                        {mostrarCambioPassword ? "Cancelar cambio de contraseña" : "Modificar contraseña"}
                      </Button>
                    </div>

                    {mostrarCambioPassword && (
                      <div className="grid gap-4 pt-2 border-t border-white/10">
                        <div className="grid gap-2">
                          <Label htmlFor="my-current-password">Contraseña actual</Label>
                          <Input
                            id="my-current-password"
                            type="password"
                            placeholder="Introduce tu contraseña actual"
                            value={formPropio.currentPassword}
                            onChange={(e) =>
                              setFormPropio((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            required={mostrarCambioPassword}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="my-new-password">Nueva contraseña</Label>
                            <Input
                              id="my-new-password"
                              type="password"
                              placeholder="Mínimo 6 caracteres"
                              value={formPropio.newPassword}
                              onChange={(e) =>
                                setFormPropio((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                              required={mostrarCambioPassword}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="my-confirm-password">Repite la nueva contraseña</Label>
                            <Input
                              id="my-confirm-password"
                              type="password"
                              placeholder="Repite la nueva contraseña"
                              value={formPropio.confirmPassword}
                              onChange={(e) =>
                                setFormPropio((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              required={mostrarCambioPassword}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={cancelarEdicionPropia}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={guardandoPropio}>
                      {guardandoPropio ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
      </motion.div>

      {/* Sección 2: Editar datos de un jugador (Solo Admin) */}
      {isAdmin ? (
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
                <CardTitle>Editar datos de un jugador</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Como administrador, puedes modificar los datos personales de cualquier otro usuario.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor={jugadorSelectId}>Seleccionar jugador</Label>
                  <BuscadorJugador
                    id={jugadorSelectId}
                    usuarios={usuarios.filter((u) => u.id !== user?.id)}
                    value={usuarioSeleccionadoId}
                    onChange={handleSeleccionarJugador}
                  />
                </div>

                {usuarioSeleccionadoId !== null ? (
                  <>
                    {errorJugador ? (
                      <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {errorJugador}
                      </p>
                    ) : null}

                    <form onSubmit={handleGuardarJugador} className="space-y-4 pt-2">
                      <div className="grid gap-2">
                        <Label htmlFor="jugador-email">Correo electrónico</Label>
                        <Input
                          id="jugador-email"
                          type="email"
                          value={formJugador.email}
                          onChange={(e) =>
                            setFormJugador((prev) => ({ ...prev, email: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="jugador-nombre">Nombre</Label>
                          <Input
                            id="jugador-nombre"
                            type="text"
                            value={formJugador.nombre}
                            onChange={(e) =>
                              setFormJugador((prev) => ({ ...prev, nombre: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="jugador-apellidos">Apellidos</Label>
                          <Input
                            id="jugador-apellidos"
                            type="text"
                            value={formJugador.apellidos}
                            onChange={(e) =>
                              setFormJugador((prev) => ({ ...prev, apellidos: e.target.value }))
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="jugador-telefono">Teléfono de contacto</Label>
                        <Input
                          id="jugador-telefono"
                          type="text"
                          placeholder="Ej: 600123123"
                          value={formJugador.telefono}
                          onChange={(e) =>
                            setFormJugador((prev) => ({ ...prev, telefono: e.target.value }))
                          }
                        />
                      </div>

                      {/* Asignar nueva contraseña para jugador por admin */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-white/10">
                        <div className="grid gap-2">
                          <Label htmlFor="jugador-new-password">Nueva contraseña (opcional)</Label>
                          <Input
                            id="jugador-new-password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={formJugador.newPassword}
                            onChange={(e) =>
                              setFormJugador((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="jugador-confirm-password">Repite la nueva contraseña</Label>
                          <Input
                            id="jugador-confirm-password"
                            type="password"
                            placeholder="Repite la contraseña"
                            value={formJugador.confirmPassword}
                            onChange={(e) =>
                              setFormJugador((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={guardandoJugador}>
                          {guardandoJugador ? "Guardando..." : "Guardar datos del jugador"}
                        </Button>
                      </div>
                    </form>
                  </>
                ) : null}
              </CardContent>
            </Card>
        </motion.div>
      ) : null}

      {/* Sección Privacidad y datos (RGPD) */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle>Privacidad y control de datos</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Ejerce tus derechos de portabilidad y supresión de datos conforme al RGPD y a la legislación de protección de datos.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Portabilidad de datos</h3>
                <p className="text-xs text-muted-foreground">
                  Descarga una copia estructurada en formato JSON de tus datos de perfil e historial de reservas.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleDescargarDatos}
                disabled={descargandoDatos}
                className="shrink-0"
              >
                {descargandoDatos ? "Generando..." : "Descargar mis datos"}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 backdrop-blur-sm">
              <div>
                <h3 className="text-sm font-semibold text-destructive">Eliminación definitiva de cuenta</h3>
                <p className="text-xs text-muted-foreground">
                  Anonimiza tus datos personales de forma irreversible y revoca todas las sesiones activas.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setTextoConfirmacion("");
                  setErrorEliminar("");
                  setOpenDeleteModal(true);
                }}
                className="shrink-0"
              >
                Eliminar mi cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal de confirmación para eliminar cuenta */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              ¿Eliminar cuenta de forma definitiva?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm text-muted-foreground">
            <p>
              Esta acción es <strong className="text-foreground">irreversible</strong>. Tus datos personales serán anonimizados de inmediato conforme al RGPD y tus sesiones se cerrarán permanentemente.
            </p>
            {errorEliminar && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errorEliminar}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="confirmar-eliminar-input" className="text-xs text-foreground">
                Para confirmar, escribe exactamente la palabra <span className="font-bold text-destructive">ELIMINAR</span>:
              </Label>
              <Input
                id="confirmar-eliminar-input"
                type="text"
                value={textoConfirmacion}
                onChange={(e) => setTextoConfirmacion(e.target.value)}
                placeholder="ELIMINAR"
                disabled={eliminandoCuenta}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="secondary"
              onClick={() => setOpenDeleteModal(false)}
              disabled={eliminandoCuenta}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmarEliminarCuenta}
              disabled={textoConfirmacion !== "ELIMINAR" || eliminandoCuenta}
            >
              {eliminandoCuenta ? "Eliminando..." : "Confirmar eliminación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
