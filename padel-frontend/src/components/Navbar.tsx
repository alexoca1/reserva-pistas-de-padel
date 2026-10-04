import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/Avatar";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/60 text-foreground backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/favicon.svg" alt="Logo Pádel Reservas" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-semibold">Pádel Reservas</span>
        </div>

        {isAuthenticated ? (
          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-2">
              <NavLink to="/dashboard" className={getNavLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/pistas" className={getNavLinkClass}>
                Pistas
              </NavLink>
              <NavLink to="/instalaciones" className={getNavLinkClass}>
                Instalaciones
              </NavLink>
              <NavLink to="/reservas" className={getNavLinkClass}>
                Reservas
              </NavLink>
              <NavLink to="/perfil" className={getNavLinkClass}>
                Perfil
              </NavLink>
            </nav>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar
                  url={user?.avatarUrl}
                  nombre={user?.nombre}
                  apellidos={user?.apellidos}
                  id={user?.id}
                  size={28}
                />
                {user?.nombre ?? "Usuario"}
              </span>
              <Button variant="secondary" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-2">
              <NavLink to="/" className={getNavLinkClass}>
                Inicio
              </NavLink>
              <NavLink to="/pistas" className={getNavLinkClass}>
                Pistas
              </NavLink>
              <NavLink to="/instalaciones" className={getNavLinkClass}>
                Instalaciones
              </NavLink>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => navigate("/login")}>
                Iniciar sesión
              </Button>
            </div>
          </div>
        )}

        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-border p-2 text-foreground transition hover:bg-secondary/60 md:hidden"
        >
          <span className="sr-only">Menú</span>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-3 px-4 py-3 sm:px-6">
              {isAuthenticated ? (
                <>
                  <nav className="flex flex-col gap-2">
                    <NavLink to="/dashboard" className={getNavLinkClass} onClick={closeMenu}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/pistas" className={getNavLinkClass} onClick={closeMenu}>
                      Pistas
                    </NavLink>
                    <NavLink to="/instalaciones" className={getNavLinkClass} onClick={closeMenu}>
                      Instalaciones
                    </NavLink>
                    <NavLink to="/reservas" className={getNavLinkClass} onClick={closeMenu}>
                      Reservas
                    </NavLink>
                    <NavLink to="/perfil" className={getNavLinkClass} onClick={closeMenu}>
                      Perfil
                    </NavLink>
                  </nav>
                  <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar
                        url={user?.avatarUrl}
                        nombre={user?.nombre}
                        apellidos={user?.apellidos}
                        id={user?.id}
                        size={28}
                      />
                      {user?.nombre ?? "Usuario"}
                    </span>
                    <Button variant="secondary" onClick={handleLogout} className="w-full justify-center">
                      Cerrar sesión
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <nav className="flex flex-col gap-2">
                    <NavLink to="/" className={getNavLinkClass} onClick={closeMenu}>
                      Inicio
                    </NavLink>
                    <NavLink to="/pistas" className={getNavLinkClass} onClick={closeMenu}>
                      Pistas
                    </NavLink>
                    <NavLink to="/instalaciones" className={getNavLinkClass} onClick={closeMenu}>
                      Instalaciones
                    </NavLink>
                  </nav>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      closeMenu();
                      navigate("/login");
                    }}
                    className="w-full justify-center"
                  >
                    Iniciar sesión
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
