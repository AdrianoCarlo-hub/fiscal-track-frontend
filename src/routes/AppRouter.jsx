import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/common/Layout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingState from '../components/ui/LoadingState';
import { useAuth } from '../context/useAuth';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import NonAutorisePage from '../pages/NonAutorisePage';
import { getRouteParRole, ROUTES } from './configRoutes';

function ChargementPage() {
  return (
    <div className="py-6">
      <LoadingState message="Chargement de la page…" lignes={4} />
    </div>
  );
}

function ContenuPage({ children }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname}>
      <Suspense fallback={<ChargementPage />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

function AvecLayout({ roles, children }) {
  return (
    <ProtectedRoute rolesAutorises={roles}>
      <Layout>
        <ContenuPage>{children}</ContenuPage>
      </Layout>
    </ProtectedRoute>
  );
}

function AccueilRedirect() {
  const { utilisateur } = useAuth();
  return <Navigate to={utilisateur ? getRouteParRole(utilisateur.role) : '/login'} replace />;
}

function PageInconnue() {
  const { utilisateur } = useAuth();
  if (!utilisateur) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <NotFoundPage />
    </Layout>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <ErrorBoundary>
              <LoginPage />
            </ErrorBoundary>
          }
        />
        <Route path="/" element={<AccueilRedirect />} />
        <Route
          path="/non-autorise"
          element={
            <AvecLayout>
              <NonAutorisePage />
            </AvecLayout>
          }
        />

        {ROUTES.map((route) => {
          const Page = route.composant;
          return (
            <Route
              key={route.id}
              path={route.chemin}
              element={
                <AvecLayout roles={route.roles}>
                  <Page />
                </AvecLayout>
              }
            />
          );
        })}

        <Route path="*" element={<PageInconnue />} />
      </Routes>
    </BrowserRouter>
  );
}
