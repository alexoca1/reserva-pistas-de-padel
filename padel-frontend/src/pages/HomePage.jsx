import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      icon: "⚡",
    },
    {
      id: 2,
      title: "Gestión de Pistas",
      description:
        "Visualiza todas las pistas disponibles y elige la que mejor se adapte a ti.",
      icon: "🎾",
    },
    {
      id: 3,
      title: "Historial de Reservas",
      description:
        "Accede a tu historial completo de reservas y gestiona tus citas.",
      icon: "📅",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 inline-block">
            <div className="rounded-full bg-emerald-500/20 border border-emerald-500 px-6 py-2">
              <span className="text-sm font-semibold text-emerald-400">
                Bienvenido a Pádel Reservas
              </span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Reserva tus pistas de{" "}
            <span className="text-emerald-400">pádel</span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            La forma más rápida y fácil de encontrar y reservar pistas de pádel.
            Administra tus reservas, consulta disponibilidad y disfruta jugando.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={handleCTA}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-lg"
            >
              {isAuthenticated ? "Ir al Dashboard" : "Comenzar Ahora"}
            </Button>
            <Button
              onClick={() => navigate("/pistas")}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-lg border border-slate-600"
            >
              Ver Pistas
            </Button>
          </div>

          {/* Hero Image/Illustration */}
          <div className="rounded-lg overflow-hidden shadow-2xl border border-slate-700/50">
            <div className="bg-gradient-to-b from-emerald-500/20 to-slate-800 aspect-video flex items-center justify-center">
              <div className="text-7xl">🏓🤾‍♂️🎾</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-xl text-slate-400">
              Características que hacen tu experiencia única
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ventajas.map((ventaja) => (
              <Card
                key={ventaja.id}
                className="flex flex-col h-full hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
              >
                <CardHeader>
                  <div className="text-4xl mb-3">{ventaja.icon}</div>
                  <CardTitle className="text-white">{ventaja.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-slate-300 leading-relaxed">
                    {ventaja.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/50 rounded-lg p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿Listo para jugar?
            </h2>
            <p className="text-lg text-slate-300 mb-8">
              {isAuthenticated
                ? "Accede a tu cuenta y comienza a reservar pistas."
                : "Crea tu cuenta ahora y disfruta de todos los beneficios."}
            </p>
            <Button
              onClick={handleCTA}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-lg"
            >
              {isAuthenticated ? "Ir al Dashboard" : "Registrarse Gratis"}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-slate-800 px-4 py-8 text-center text-slate-400">
        <p className="text-sm">
          © 2026 Pádel Reservas. Todos los derechos reservados.
        </p>
      </section>
    </div>
  );
}
