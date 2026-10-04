/*
 * Reserva de Pistas de Pádel — Club Pádel Calatrava
 * Copyright (c) 2026 Alexander Ocampo Hernandez
 * Licencia: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 *           https://creativecommons.org/licenses/by-nc-sa/4.0/
 * Repositorio: https://github.com/alexoca1/reserva-pistas-de-padel
 */
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PistasPage } from "./pages/PistasPage";
import { ReservasPage } from "./pages/ReservasPage";
import { PerfilPage } from "./pages/PerfilPage";
import { InstalacionesPage } from "./pages/InstalacionesPage";
import { PrivacidadPage } from "./pages/PrivacidadPage";
import { TerminosPage } from "./pages/TerminosPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { DemoBanner } from "./components/DemoBanner";
import { CookieBanner } from "./components/CookieBanner";

function App() {
  return (
    <>
      <DemoBanner />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="privacidad" element={<PrivacidadPage />} />
          <Route path="terminos" element={<TerminosPage />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="pistas"
            element={<PistasPage />}
          />
          <Route path="instalaciones" element={<InstalacionesPage />} />
          <Route
            path="reservas"
            element={
              <ProtectedRoute>
                <ReservasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="perfil"
            element={
              <ProtectedRoute>
                <PerfilPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CookieBanner />
    </>
  );
}

export default App;
