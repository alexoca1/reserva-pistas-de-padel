import { useEffect, useLayoutEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconInstagram,
  IconFacebook,
  IconX,
  IconWhatsapp,
} from "./icons";

// Datos de ejemplo para rellenar el diseño. Sustituye dirección, teléfono,
// email y enlaces de redes por los reales antes de publicar el proyecto.
const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://instagram.com/padelreservas", Icon: IconInstagram },
  { name: "Facebook", href: "https://facebook.com/padelreservas", Icon: IconFacebook },
  { name: "X", href: "https://x.com/padelreservas", Icon: IconX },
  { name: "WhatsApp", href: "https://wa.me/34926123456", Icon: IconWhatsapp },
];

const TITULOS_POR_RUTA: Record<string, string> = {
  "/": "Inicio",
  "/login": "Iniciar sesión",
  "/register": "Crear cuenta",
  "/dashboard": "Dashboard",
  "/pistas": "Pistas",
  "/reservas": "Reservas",
  "/perfil": "Perfil",
  "/instalaciones": "Instalaciones — Club Pádel Calatrava",
  "/privacidad": "Política de Privacidad",
  "/terminos": "Términos y Condiciones",
};

const DESCRIPCION_BASE =
  "Reserva tus pistas de pádel en segundos. Consulta disponibilidad, gestiona tus reservas y disfruta jugando en Club Pádel Calatrava.";

const DESCRIPCIONES_POR_RUTA: Record<string, string> = {
  "/": "Reserva tus pistas de pádel en segundos. Consulta disponibilidad y gestiona tus reservas en Club Pádel Calatrava.",
  "/pistas": "Consulta todas las pistas de pádel disponibles, horarios y disponibilidad en tiempo real.",
  "/instalaciones": "Conoce las instalaciones del Club Pádel Calatrava: pistas, servicios y galería de fotos.",
  "/dashboard": "Tu panel de control: próximas reservas, acceso rápido y gestión de tu actividad.",
  "/reservas": "Crea, edita y cancela tus reservas de pádel de forma sencilla.",
  "/perfil": "Gestiona tus datos personales, cambia tu contraseña y actualiza tu foto de perfil.",
  "/privacidad": "Política de privacidad y protección de datos del Club Pádel Calatrava.",
  "/terminos": "Términos y condiciones de uso del servicio de reservas de pádel.",
};

export function Layout() {
  const location = useLocation();
  const navbarWrapperRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const titulo = TITULOS_POR_RUTA[location.pathname];
    document.title =
      location.pathname === "/"
        ? "Pádel Reservas"
        : titulo
          ? `${titulo} · Pádel Reservas`
          : "Pádel Reservas";
  }, [location.pathname]);

  useEffect(() => {
    const descripcion = DESCRIPCIONES_POR_RUTA[location.pathname] || DESCRIPCION_BASE;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", descripcion);
    }
  }, [location.pathname]);

  useLayoutEffect(() => {
    const updateChromeHeights = () => {
      const navbarHeight = navbarWrapperRef.current?.offsetHeight;
      const footerHeight = footerRef.current?.offsetHeight;
      if (navbarHeight) {
        document.documentElement.style.setProperty("--navbar-height", `${navbarHeight}px`);
      }
      if (footerHeight) {
        document.documentElement.style.setProperty("--footer-height", `${footerHeight}px`);
      }
    };

    updateChromeHeights();
    window.addEventListener("resize", updateChromeHeights);
    return () => window.removeEventListener("resize", updateChromeHeights);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden text-foreground">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-[130px] animate-aurora" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-[110px] animate-aurora [animation-delay:-8s]" />
      </div>

      <div ref={navbarWrapperRef}>
        <Navbar />
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer ref={footerRef} className="border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.svg" alt="Logo Pádel Reservas" className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-semibold text-foreground">Pádel Reservas</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Reserva tu pista de pádel en segundos. Consulta disponibilidad,
              gestiona tus reservas y juega.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Enlaces</p>
            <nav className="mt-3 flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground transition hover:text-primary">
                Inicio
              </Link>
              <Link to="/pistas" className="text-sm text-muted-foreground transition hover:text-primary">
                Pistas
              </Link>
              <Link to="/reservas" className="text-sm text-muted-foreground transition hover:text-primary">
                Reservas
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground transition hover:text-primary">
                Iniciar sesión
              </Link>
              <Link to="/privacidad" className="text-sm text-muted-foreground transition hover:text-primary">
                Privacidad
              </Link>
              <Link to="/terminos" className="text-sm text-muted-foreground transition hover:text-primary">
                Términos
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Contacto</p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Av. del Deporte 12, Ciudad Real
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconPhone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+34926123456" className="transition hover:text-primary">
                  +34 926 123 456
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconMail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:hola@padelreservas.es" className="transition hover:text-primary">
                  hola@padelreservas.es
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Síguenos</p>
            <div className="mt-3 flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary transition hover:border-primary/40 hover:bg-primary/10"
                >
                  <social.Icon className="h-4 w-4 text-primary" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <span>© 2026 Pádel Reservas. Todos los derechos reservados.</span>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/privacidad" className="transition hover:text-primary">
              Privacidad
            </Link>
            <span>·</span>
            <Link to="/terminos" className="transition hover:text-primary">
              Términos
            </Link>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem("cookie_consent");
                } catch {
                  // Ignorar fallo de almacenamiento
                }
                window.location.reload();
              }}
              className="transition hover:text-primary"
            >
              Gestionar cookies
            </button>
          </div>
        </div>
        <p className="border-t border-white/5 px-4 py-2 text-center text-xs text-muted-foreground/60 sm:px-6 lg:px-8">
          Proyecto educativo sin actividad comercial · Datos ficticios · Imágenes generadas con inteligencia artificial
        </p>
      </footer>
    </div>
  );
}