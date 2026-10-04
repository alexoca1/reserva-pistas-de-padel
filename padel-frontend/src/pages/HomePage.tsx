import { useRef, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/TiltCard";
import { IconBolt, IconCourt, IconCalendarCheck } from "@/components/icons";
import { fadeUp, fadeScale, staggerContainer } from "@/lib/motion";
import padelHeroImage from "../assets/padel-hero-image.png";

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const heroRef = useRef<HTMLElement>(null);
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlightBackground = useMotionTemplate`radial-gradient(560px circle at ${spotlightX}px ${spotlightY}px, hsl(var(--primary) / 0.16), transparent 70%)`;

  const handleHeroMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    spotlightX.set(event.clientX - rect.left);
    spotlightY.set(event.clientY - rect.top);
  };

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const ventajas = [
    {
      id: 1,
      title: "Reserva Fácil",
      description:
        "Reserva tus pistas de pádel en segundos. Interfaz intuitiva y rápida.",
      Icon: IconBolt,
    },
    {
      id: 2,
      title: "Gestión de Pistas",
      description:
        "Visualiza todas las pistas disponibles y elige la que mejor se adapte a ti.",
      Icon: IconCourt,
    },
    {
      id: 3,
      title: "Historial de Reservas",
      description:
        "Accede a tu historial completo de reservas y gestiona tus citas.",
      Icon: IconCalendarCheck,
    },
  ];

  return (
    <div className="bg-gradient-to-b from-background via-secondary/10 to-background">
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative isolate flex min-h-screen items-center justify-center px-4 py-12 lg:min-h-[calc(100vh-var(--navbar-height,4rem)-var(--footer-height,18rem)-4rem)] lg:flex-col lg:gap-6 lg:py-4"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-12%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] animate-aurora" />
          <div className="absolute bottom-[-18%] right-[-12%] h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-[100px] animate-aurora [animation-delay:-6s]" />
        </div>

        {!prefersReducedMotion ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: spotlightBackground }}
          />
        ) : null}

        <motion.div
          className="mx-auto grid w-full max-w-3xl items-center gap-10 lg:max-w-6xl lg:grid-cols-2 lg:gap-16"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="text-center lg:text-left">
            <motion.div variants={fadeUp} className="mb-4 inline-block">
              <div className="rounded-full border border-primary/40 bg-primary/15 px-6 py-2">
                <span className="text-sm font-semibold text-primary">
                  Bienvenido a Pádel Reservas
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6"
            >
              Reserva tus pistas de{" "}
              <span className="text-primary">pádel</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl lg:text-lg text-muted-foreground mb-6 leading-relaxed"
            >
              La forma más rápida y fácil de encontrar y reservar pistas de pádel.
              Administra tus reservas, consulta disponibilidad y disfruta jugando.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button onClick={handleCTA} className="px-8 py-3 text-lg font-semibold">
                {isAuthenticated ? "Ir al Dashboard" : "Comenzar Ahora"}
              </Button>
              <Button
                onClick={() => navigate("/pistas")}
                variant="outline"
                className="px-8 py-3 text-lg font-semibold"
              >
                Ver Pistas
              </Button>
            </motion.div>
          </div>

          <motion.div variants={fadeScale} className="relative">
            <TiltCard className="rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <img
                src={padelHeroImage}
                alt="Pistas de pádel iluminadas en interior — Club Pádel Calatrava"
                className="block aspect-video w-full object-cover"
              />
            </TiltCard>
          </motion.div>
        </motion.div>

        <motion.div
          className="hidden w-full max-w-6xl mx-auto lg:grid lg:grid-cols-3 lg:gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.45 } },
          }}
        >
          {ventajas.map((ventaja) => (
            <motion.div key={ventaja.id} variants={fadeUp}>
              <TiltCard className="flex items-start gap-3 rounded-xl border border-white/12 bg-card/95 px-4 py-3 backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-card">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary shadow-[0_0_18px_-6px_hsl(var(--primary)/0.6)]">
                  <ventaja.Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {ventaja.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {ventaja.description}
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="relative isolate overflow-hidden px-4 py-16 sm:py-20 lg:hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-[100px] animate-aurora" />
          <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 rounded-full bg-primary/10 blur-[90px] animate-aurora [animation-delay:-10s]" />
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-xl text-muted-foreground">
              Características que hacen tu experiencia única
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={staggerContainer}
          >
            {ventajas.map((ventaja) => (
              <motion.div key={ventaja.id} variants={fadeUp}>
                <TiltCard className="group rounded-2xl border border-white/12 bg-card/95 p-6 shadow-[0_10px_36px_-10px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-card">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-[0_0_24px_-6px_hsl(var(--primary)/0.6)] transition-shadow group-hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.8)]">
                    <ventaja.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {ventaja.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {ventaja.description}
                  </p>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.section
        className="px-4 py-16 sm:py-20 lg:hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              ¿Listo para jugar?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {isAuthenticated
                ? "Accede a tu cuenta y comienza a reservar pistas."
                : "Crea tu cuenta ahora y disfruta de todos los beneficios."}
            </p>
            <Button onClick={handleCTA} className="px-8 py-3 text-lg font-semibold">
              {isAuthenticated ? "Ir al Dashboard" : "Registrarse Gratis"}
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}