import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Verificar si hay token en localStorage al cargar
  useEffect(() => {
    const tokenGuardado = localStorage.getItem("authToken");
    if (tokenGuardado) {
      setToken(tokenGuardado);
      obtenerPerfil(tokenGuardado);
    } else {
      setCargando(false);
    }
  }, []);

  // Obtener perfil del usuario con el token
  const obtenerPerfil = async (tokenAuth) => {
    try {
      const respuesta = await fetch(`${API_BASE_URL}/auth/perfil`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenAuth}`,
          "Content-Type": "application/json",
        },
      });

      if (!respuesta.ok) {
        throw new Error("Error al obtener perfil");
      }

      const datosUsuario = await respuesta.json();
      setUser(datosUsuario);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      localStorage.removeItem("authToken");
      setToken(null);
      setUser(null);
    } finally {
      setCargando(false);
    }
  };

  // Función login
  const login = async (email, password) => {
    try {
      setCargando(true);

      // Primera petición: obtener token
      const respuestaLogin = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!respuestaLogin.ok) {
        throw new Error("Email o contraseña incorrectos");
      }

      const { token: nuevoToken } = await respuestaLogin.json();

      // Guardar token en localStorage
      localStorage.setItem("authToken", nuevoToken);
      setToken(nuevoToken);

      // Segunda petición: obtener datos del usuario
      const respuestaPerfil = await fetch(`${API_BASE_URL}/auth/perfil`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${nuevoToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!respuestaPerfil.ok) {
        throw new Error("Error al obtener datos del usuario");
      }

      const datosUsuario = await respuestaPerfil.json();
      setUser(datosUsuario);

      return datosUsuario;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    } finally {
      setCargando(false);
    }
  };

  // Función logout
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  // Booleano para autenticación
  const isAuthenticated = !!token && !!user;
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.roles
      ? [user.roles]
      : [];
  const hasRole = (role) => roles.includes(role);
  const isAdmin = hasRole("ROLE_ADMIN");

  const valor = {
    token,
    user,
    roles,
    hasRole,
    isAdmin,
    cargando,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Hook personalizado
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return contexto;
}
