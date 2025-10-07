import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminUsersPage from "./pages/AdminPage";
import UserFormPage from "./pages/UserFormPage";

import MatriculasListPage from "./pages/MatriculasListPage";
import MatriculaFormPage from "./pages/MatriculaFormPage";
import PagosListPage from "./pages/PagosListPage";
import EstudiantesListPage from "./pages/EstudiantesListPage";
import EstudianteFormPage from "./pages/StudentFormPage";
import ReportesPage from "./pages/ReportesPage";
import ConfiguracionPage from "./pages/ConfigurationPage";

import Layout from "./components/Layout/Layout";

import InstitutionConfigPage from "./pages/config/InstitutionConfigPage";
import LevelsConfigPage from "./pages/config/LevelsConfigPage";
import GradesConfigPage from "./pages/config/GradesConfigPage";
import SectionsConfigPage from "./pages/config/SectionsConfigPage";
import TiposPagoConfigPage from "./pages/config/TiposPagoConfigPage";
import MetodosPagoConfigPage from "./pages/config/MetodosPagoConfigPage";

const ProtectedRoute = ({ element: Element, allowedRoles, ...rest }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Cargando...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some((role) => user.rol === role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Element {...rest} />;
};

function App() {
  const generalManagerRoles = ["Secretaria", "Administrador"];

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={DashboardPage} />}
            />

            {/* Rutas para Secretaria y Administrador */}
            <Route
              path="/matriculas"
              element={
                <ProtectedRoute
                  element={MatriculasListPage}
                  allowedRoles={generalManagerRoles}
                />
              }
            />
            <Route
              path="/matriculas/new"
              element={
                <ProtectedRoute
                  element={MatriculaFormPage}
                  allowedRoles={generalManagerRoles}
                />
              }
            />
            <Route
              path="/matriculas/edit/:id"
              element={
                <ProtectedRoute
                  element={MatriculaFormPage}
                  allowedRoles={generalManagerRoles}
                />
              }
            />

            <Route
              path="/pagos"
              element={
                <ProtectedRoute
                  element={PagosListPage}
                  allowedRoles={generalManagerRoles}
                />
              }
            />
            <Route
              path="/estudiantes"
              element={
                <ProtectedRoute
                  element={EstudiantesListPage}
                  allowedRoles={generalManagerRoles}
                />
              }
            />
            <Route
              path="/students/new"
              element={
                <ProtectedRoute
                  element={EstudianteFormPage}
                  allowedRoles={generalManagerRoles}
                />
              }
            />
            <Route
              path="/students/edit/:id"
              element={
                <ProtectedRoute
                  element={EstudianteFormPage}
                  allowedRoles={generalManagerRoles}
                />
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute
                  element={AdminUsersPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />
            <Route
              path="/admin/users/new"
              element={
                <ProtectedRoute
                  element={UserFormPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />
            <Route
              path="/admin/users/edit/:id"
              element={
                <ProtectedRoute
                  element={UserFormPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />

            <Route
              path="/admin/reportes"
              element={
                <ProtectedRoute
                  element={ReportesPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />

            <Route
              path="/configuracion"
              element={
                <ProtectedRoute
                  element={ConfiguracionPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />
            <Route
              path="/configuracion/institucion"
              element={
                <ProtectedRoute
                  element={InstitutionConfigPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />
            <Route
              path="/configuracion/niveles"
              element={
                <ProtectedRoute
                  element={LevelsConfigPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />
            <Route
              path="/configuracion/grados"
              element={
                <ProtectedRoute
                  element={GradesConfigPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />
            <Route
              path="/configuracion/secciones"
              element={
                <ProtectedRoute
                  element={SectionsConfigPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />
            <Route
              path="/configuracion/tipos_pago"
              element={
                <ProtectedRoute
                  element={TiposPagoConfigPage}
                  allowedRoles={["Administrador"]}
                />
              }
            />
            <Route
              path="/configuracion/metodos_pago"
              element={
                <ProtectedRoute
                  element={MetodosPagoConfigPage} 
                  allowedRoles={["Administrador"]}
                />
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <div className="p-8 text-center text-xl">
                Página no encontrada
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
