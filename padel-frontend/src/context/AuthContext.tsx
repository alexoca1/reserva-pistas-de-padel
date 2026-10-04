import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Usuario } from "../types";
import { setMemoryAccessToken, API_BASE_URL } from "../services/api";

interface AuthContextValue {
  token: string | null;
  user: Usuario | null;
  roles: string[];
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  isDemoAdmin: boolean;
  cargando: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => Promise<void>;
  actualizarUsuario: (datos: Partial<Usuario>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  // Inicialización de sesión mediante refresco silencioso con Cookie HttpOnly
  useEffect(() => {
    let montado = true;

    const inicializarSesion = async () => {
      try {
        const respuesta = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!respuesta.ok) {
          if (montado) {
            setToken(null);
            setMemoryAccessToken(null);
            setUser(null);
          }
          return;
        }

        const data = (await respuesta.json()) as {
          token?: string;
          accessToken?: string;
          user: Usuario;
        };

        const nuevoToken = data.accessToken || data.token || null;
        if (montado) {
          setToken(nuevoToken);
          setMemoryAccessToken(nuevoToken);
          setUser(data.user);
        }
      } catch (error) {
        console.warn("No hay sesión activa o falló el refresco:", error);
        if (montado) {
          setToken(null);
          setMemoryAccessToken(null);
          setUser(null);
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    };

    void inicializarSesion();

    const handleUnauthorized = () => {
      setToken(null);
      setMemoryAccessToken(null);
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      montado = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string): Promise<Usuario> => {
    try {
      setCargando(true);

      const respuestaLogin = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!respuestaLogin.ok) {
        let mensaje = "Email o contraseña incorrectos";
        try {
          const errorData = await respuestaLogin.json() as { message?: string; error?: string };
          if (errorData?.message) mensaje = errorData.message;
          else if (errorData?.error) mensaje = errorData.error;
        } catch {
          // Ignorar si no hay JSON
        }
        throw new Error(mensaje);
      }

      const data = (await respuestaLogin.json()) as {
        token?: string;
        accessToken?: string;
        user: Usuario;
      };

      const nuevoToken = data.accessToken || data.token || null;
      setToken(nuevoToken);
      setMemoryAccessToken(nuevoToken);
      setUser(data.user);

      return data.user;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    } finally {
      setCargando(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setToken(null);
      setMemoryAccessToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = !!token && !!user;
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.roles
      ? [user.roles]
      : [];
  const hasRole = (role: string) => roles.includes(role);
  const isAdmin = hasRole("ROLE_ADMIN");
  const isDemoAdmin = user?.tipoAdmin === "DEMO_ADMIN";

  const actualizarUsuario = (datos: Partial<Usuario>) => {
    setUser((prev) => (prev ? { ...prev, ...datos } : prev));
  };

  const valor: AuthContextValue = {
    token,
    user,
    roles,
    hasRole,
    isAdmin,
    isDemoAdmin,
    cargando,
    isAuthenticated,
    login,
    logout,
    actualizarUsuario,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook del mismo contexto
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return contexto;
}
