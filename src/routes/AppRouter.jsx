import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/common/Layout';

import LoginPage from '../pages/auth/LoginPage';
import CalendrierPage from '../pages/contribuable/CalendrierPage';
import ObligationsPage from '../pages/contribuable/ObligationsPage';
import DeclarationsPage from '../pages/contribuable/DeclarationsPage';
import DeposerDeclarationPage from '../pages/contribuable/DeposerDeclarationPage';
import PaiementsPage from '../pages/contribuable/PaiementsPage';
import DettesPage from '../pages/contribuable/DettesPage';
import NotificationsPage from '../pages/contribuable/NotificationsPage';
import DossiersPage from '../pages/agent/DossiersPage';
import DossierDetailPage from '../pages/agent/DossierDetailPage';
import DeclarationsAgentPage from '../pages/agent/DeclarationsAgentPage';
import PaiementsAgentPage from '../pages/agent/PaiementsAgentPage';
import DettesAgentPage from '../pages/agent/DettesAgentPage';
import NotificationsAgentPage from '../pages/agent/NotificationsAgentPage';
import DashboardPage from '../pages/responsable/DashboardPage';
import IndicateursPage from '../pages/responsable/IndicateursPage';
import RetardsPage from '../pages/responsable/RetardsPage';
import RecouvrementPage from '../pages/responsable/RecouvrementPage';
import RapportsPage from '../pages/responsable/RapportsPage';
import UtilisateursPage from '../pages/admin/UtilisateursPage';
import RolesPage from '../pages/admin/RolesPage';
import TypesImpotsPage from '../pages/admin/TypesImpotsPage';
import JoursFeriesPage from '../pages/admin/JoursFeriesPage';
import ParametresPage from '../pages/admin/ParametresPage';

function AvecLayout({ roles, children }) {
  return (
    <ProtectedRoute rolesAutorises={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Contribuable */}
        <Route path="/contribuable/calendrier" element={<AvecLayout roles={['CONTRIBUABLE']}><CalendrierPage /></AvecLayout>} />
        <Route path="/contribuable/obligations" element={<AvecLayout roles={['CONTRIBUABLE']}><ObligationsPage /></AvecLayout>} />
        <Route path="/contribuable/declarations" element={<AvecLayout roles={['CONTRIBUABLE']}><DeclarationsPage /></AvecLayout>} />
        <Route path="/contribuable/declarations/deposer/:idObligation" element={<AvecLayout roles={['CONTRIBUABLE']}><DeposerDeclarationPage /></AvecLayout>} />
        <Route path="/contribuable/paiements" element={<AvecLayout roles={['CONTRIBUABLE']}><PaiementsPage /></AvecLayout>} />
        <Route path="/contribuable/dettes" element={<AvecLayout roles={['CONTRIBUABLE']}><DettesPage /></AvecLayout>} />
        <Route path="/contribuable/notifications" element={<AvecLayout roles={['CONTRIBUABLE']}><NotificationsPage /></AvecLayout>} />

        {/* Agent */}
        <Route path="/agent/dossiers" element={<AvecLayout roles={['AGENT_GESTION', 'AGENT_RECETTE']}><DossiersPage /></AvecLayout>} />
        <Route path="/agent/dossiers/:nif" element={<AvecLayout roles={['AGENT_GESTION', 'AGENT_RECETTE']}><DossierDetailPage /></AvecLayout>} />
        <Route path="/agent/declarations" element={<AvecLayout roles={['AGENT_GESTION']}><DeclarationsAgentPage /></AvecLayout>} />
        <Route path="/agent/paiements" element={<AvecLayout roles={['AGENT_RECETTE']}><PaiementsAgentPage /></AvecLayout>} />
        <Route path="/agent/dettes" element={<AvecLayout roles={['AGENT_RECETTE']}><DettesAgentPage /></AvecLayout>} />
        <Route path="/agent/notifications" element={<AvecLayout roles={['AGENT_GESTION', 'AGENT_RECETTE']}><NotificationsAgentPage /></AvecLayout>} />

        {/* Responsable */}
        <Route path="/responsable/dashboard" element={<AvecLayout roles={['RESPONSABLE', 'ADMIN']}><DashboardPage /></AvecLayout>} />
        <Route path="/responsable/indicateurs" element={<AvecLayout roles={['RESPONSABLE', 'ADMIN']}><IndicateursPage /></AvecLayout>} />
        <Route path="/responsable/retards" element={<AvecLayout roles={['RESPONSABLE', 'ADMIN']}><RetardsPage /></AvecLayout>} />
        <Route path="/responsable/recouvrement" element={<AvecLayout roles={['RESPONSABLE', 'ADMIN']}><RecouvrementPage /></AvecLayout>} />
        <Route path="/responsable/rapports" element={<AvecLayout roles={['RESPONSABLE', 'ADMIN']}><RapportsPage /></AvecLayout>} />

        {/* Admin */}
        <Route path="/admin/utilisateurs" element={<AvecLayout roles={['ADMIN']}><UtilisateursPage /></AvecLayout>} />
        <Route path="/admin/roles" element={<AvecLayout roles={['ADMIN']}><RolesPage /></AvecLayout>} />
        <Route path="/admin/types-impots" element={<AvecLayout roles={['ADMIN']}><TypesImpotsPage /></AvecLayout>} />
        <Route path="/admin/jours-feries" element={<AvecLayout roles={['ADMIN']}><JoursFeriesPage /></AvecLayout>} />
        <Route path="/admin/parametres" element={<AvecLayout roles={['ADMIN']}><ParametresPage /></AvecLayout>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
