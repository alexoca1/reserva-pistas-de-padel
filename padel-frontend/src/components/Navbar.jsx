import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";

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

  const getNavLinkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <header className="bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-slate-950">
            Pádel
          </div>
          <span className="text-lg font-semibold">Reservas</span>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-slate-700 p-2 text-slate-200 transition hover:bg-slate-800 md:hidden"
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

        {isAuthenticated ? (
          <>
            <div className="hidden w-full flex-1 items-center justify-between gap-4 md:flex md:w-auto">
              <nav className="flex flex-wrap items-center gap-2">
                <NavLink to="/dashboard" className={getNavLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/pistas" className={getNavLinkClass}>
                  Pistas
                </NavLink>
                <NavLink to="/reservas" className={getNavLinkClass}>
                  Reservas
                </NavLink>
              </nav>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-300">
                  {user?.nombre ?? "Usuario"}
                </span>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm"
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>

            <div
              className={`${
                menuOpen ? "flex" : "hidden"
              } w-full flex-col gap-3 border-t border-slate-800 pt-3 md:hidden`}
            >
              <nav className="flex flex-col gap-2">
                <NavLink
                  to="/dashboard"
                  className={getNavLinkClass}
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/pistas"
                  className={getNavLinkClass}
                  onClick={closeMenu}
                >
                  Pistas
                </NavLink>
                <NavLink
                  to="/reservas"
                  className={getNavLinkClass}
                  onClick={closeMenu}
                >
                  Reservas
                </NavLink>
              </nav>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-300">
                  {user?.nombre ?? "Usuario"}
                </span>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="w-full justify-center rounded-md px-3 py-2 text-sm"
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="hidden flex-1 flex-wrap items-center justify-end gap-3 md:flex">
              <NavLink
                to="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Inicio
              </NavLink>
              <Button
                variant="secondary"
                onClick={() => {
                  closeMenu();
                  navigate("/login");
                }}
                className="rounded-md px-3 py-2 text-sm"
              >
                Iniciar sesión
              </Button>
            </div>

            <div
              className={`${
                menuOpen ? "flex" : "hidden"
              } w-full flex-col gap-2 border-t border-slate-800 pt-3 md:hidden`}
            >
              <NavLink
                to="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                onClick={closeMenu}
              >
                Inicio
              </NavLink>
              <Button
                variant="secondary"
                onClick={() => {
                  closeMenu();
                  navigate("/login");
                }}
                className="w-full justify-center rounded-md px-3 py-2 text-sm"
              >
                Iniciar sesión
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
