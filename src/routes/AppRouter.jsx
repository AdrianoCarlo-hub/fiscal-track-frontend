import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { getRouteParRole } from './roleRoutes';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/useAuth';

import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import NonAutorisePage from '../pages/NonAutorisePage';

import CalendrierPage from '../pages/contribuable/CalendrierPage';
import ObligationsPage from '../pages/contribuable/ObligationsPage';
import DeclarationsPage from '../pages/contribuable/DeclarationsPage';
import DeposerDeclarationPage from '../pages/contribuable/DeposerDeclarationPage';
import PaiementsPage from '../pages/contribuable/PaiementsPage';
import DettesPage from '../pages/contribuable/DettesPage';
import AcomptesPage from '../pages/contribuable/AcomptesPage';
import NotificationsPage from '../pages/contribuable/NotificationsPage';
import ProfilPage from '../pages/contribuable/ProfilPage';

import DossiersPage from '../pages/agent/DossiersPage';
import DossierDetailPage from '../pages/agent/DossierDetailPage';
import DeclarationsAgentPage from '../pages/agent/DeclarationsAgentPage';
import PaiementsAgentPage from '../pages/agent/PaiementsAgentPage';
import DettesAgentPage from '../pages/agent/DettesAgentPage';
import NotificationsAgentPage from '../pages/agent/NotificationsAgentPage';
import SimulateurFiscalPage from '../pages/agent/SimulateurFiscalPage';

import DashboardPage from '../pages/responsable/DashboardPage';
import RetardsPage from '../pages/responsable/RetardsPage';
import RecouvrementPage from '../pages/responsable/RecouvrementPage';
import RapportsPage from '../pages/responsable/RapportsPage';

import UtilisateursPage from '../pages/admin/UtilisateursPage';
import RolesPage from '../pages/admin/RolesPage';
import TypesImpotsPage from '../pages/admin/TypesImpotsPage';
import JoursFeriesPage from '../pages/admin/JoursFeriesPage';
import ParametresPage from '../pages/admin/ParametresPage';
import ModelesNotificationsPage from '../pages/admin/ModelesNotificationsPage';
import JournalAuditPage from '../pages/admin/JournalAuditPage';

const TOUS_LES_AGENTS = ['AGENT_GESTION', 'AGENT_RECETTE', 'RESPONSABLE', 'ADMIN'];
const RECETTE = ['AGENT_RECETTE', 'RESPONSABLE', 'ADMIN'];

function AvecLayout({ roles, children }) {
  return (
    <ProtectedRoute rolesAutorises={roles}>
      <Layout>{children}</Layout>
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AccueilRedirect />} />
        <Route
          path="/non-autorise"
          element={
            <AvecLayout>
              <NonAutorisePage />
            </AvecLayout>
          }
        />

        <Route path="/contribuable/calendrier" element={<AvecLayout roles={['CONTRIBUABLE']}><CalendrierPage /></AvecLayout>} />
        <Route path="/contribuable/obligations" element={<AvecLayout roles={['CONTRIBUABLE']}><ObligationsPage /></AvecLayout>} />
        <Route path="/contribuable/declarations" element={<AvecLayout roles={['CONTRIBUABLE']}><DeclarationsPage /></AvecLayout>} />
        <Route path="/contribuable/declarations/deposer/:idObligation" element={<AvecLayout roles={['CONTRIBUABLE']}><DeposerDeclarationPage /></AvecLayout>} />
        <Route path="/contribuable/paiements" element={<AvecLayout roles={['CONTRIBUABLE']}><PaiementsPage /></AvecLayout>} />
        <Route path="/contribuable/dettes" element={<AvecLayout roles={['CONTRIBUABLE']}><DettesPage /></AvecLayout>} />
        <Route path="/contribuable/acomptes" element={<AvecLayout roles={['CONTRIBUABLE']}><AcomptesPage /></AvecLayout>} />
        <Route path="/contribuable/notifications" element={<AvecLayout roles={['CONTRIBUABLE']}><NotificationsPage /></AvecLayout>} />
        <Route path="/contribuable/profil" element={<AvecLayout roles={['CONTRIBUABLE']}><ProfilPage /></AvecLayout>} />

        <Route path="/agent/dossiers" element={<AvecLayout roles={TOUS_LES_AGENTS}><DossiersPage /></AvecLayout>} />
        <Route path="/agent/dossiers/:nif" element={<AvecLayout roles={TOUS_LES_AGENTS}><DossierDetailPage /></AvecLayout>} />
        <Route path="/agent/declarations" element={<AvecLayout roles={TOUS_LES_AGENTS}><DeclarationsAgentPage /></AvecLayout>} />
        <Route path="/agent/paiements" element={<AvecLayout roles={RECETTE}><PaiementsAgentPage /></AvecLayout>} />
        <Route path="/agent/dettes" element={<AvecLayout roles={RECETTE}><DettesAgentPage /></AvecLayout>} />
        <Route path="/agent/notifications" element={<AvecLayout roles={TOUS_LES_AGENTS}><NotificationsAgentPage /></AvecLayout>} />
        <Route path="/agent/simulateur" element={<AvecLayout roles={TOUS_LES_AGENTS}><SimulateurFiscalPage /></AvecLayout>} />

        <Route path="/responsable/dashboard" element={<AvecLayout roles={['RESPONSABLE', 'ADMIN']}><DashboardPage /></AvecLayout>} />
        <Route path="/responsable/retards" element={<AvecLayout roles={RECETTE}><RetardsPage /></AvecLayout>} />
        <Route path="/responsable/recouvrement" element={<AvecLayout roles={['RESPONSABLE', 'ADMIN']}><RecouvrementPage /></AvecLayout>} />
        <Route path="/responsable/rapports" element={<AvecLayout roles={['RESPONSABLE', 'ADMIN']}><RapportsPage /></AvecLayout>} />

        <Route path="/admin/utilisateurs" element={<AvecLayout roles={['ADMIN']}><UtilisateursPage /></AvecLayout>} />
        <Route path="/admin/roles" element={<AvecLayout roles={['ADMIN']}><RolesPage /></AvecLayout>} />
        <Route path="/admin/types-impots" element={<AvecLayout roles={['ADMIN']}><TypesImpotsPage /></AvecLayout>} />
        <Route path="/admin/jours-feries" element={<AvecLayout roles={['ADMIN']}><JoursFeriesPage /></AvecLayout>} />
        <Route path="/admin/parametres" element={<AvecLayout roles={['ADMIN']}><ParametresPage /></AvecLayout>} />
        <Route path="/admin/modeles-notifications" element={<AvecLayout roles={['ADMIN']}><ModelesNotificationsPage /></AvecLayout>} />
        <Route path="/admin/journal-audit" element={<AvecLayout roles={['ADMIN']}><JournalAuditPage /></AvecLayout>} />

        <Route path="*" element={<PageInconnue />} />
      </Routes>
    </BrowserRouter>
  );
}
