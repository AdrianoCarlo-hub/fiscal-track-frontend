import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Contribuable */}
        <Route path="/contribuable/calendrier" element={<ProtectedRoute rolesAutorises={['CONTRIBUABLE']}><CalendrierPage /></ProtectedRoute>} />
        <Route path="/contribuable/obligations" element={<ProtectedRoute rolesAutorises={['CONTRIBUABLE']}><ObligationsPage /></ProtectedRoute>} />
        <Route path="/contribuable/declarations" element={<ProtectedRoute rolesAutorises={['CONTRIBUABLE']}><DeclarationsPage /></ProtectedRoute>} />
        <Route path="/contribuable/declarations/deposer/:idObligation" element={<ProtectedRoute rolesAutorises={['CONTRIBUABLE']}><DeposerDeclarationPage /></ProtectedRoute>} />
        <Route path="/contribuable/paiements" element={<ProtectedRoute rolesAutorises={['CONTRIBUABLE']}><PaiementsPage /></ProtectedRoute>} />
        <Route path="/contribuable/dettes" element={<ProtectedRoute rolesAutorises={['CONTRIBUABLE']}><DettesPage /></ProtectedRoute>} />
        <Route path="/contribuable/notifications" element={<ProtectedRoute rolesAutorises={['CONTRIBUABLE']}><NotificationsPage /></ProtectedRoute>} />

        {/* Agent */}
        <Route path="/agent/dossiers" element={<ProtectedRoute rolesAutorises={['AGENT_GESTION', 'AGENT_RECETTE']}><DossiersPage /></ProtectedRoute>} />
        <Route path="/agent/dossiers/:nif" element={<ProtectedRoute rolesAutorises={['AGENT_GESTION', 'AGENT_RECETTE']}><DossierDetailPage /></ProtectedRoute>} />
        <Route path="/agent/declarations" element={<ProtectedRoute rolesAutorises={['AGENT_GESTION']}><DeclarationsAgentPage /></ProtectedRoute>} />
        <Route path="/agent/paiements" element={<ProtectedRoute rolesAutorises={['AGENT_RECETTE']}><PaiementsAgentPage /></ProtectedRoute>} />
        <Route path="/agent/dettes" element={<ProtectedRoute rolesAutorises={['AGENT_RECETTE']}><DettesAgentPage /></ProtectedRoute>} />
        <Route path="/agent/notifications" element={<ProtectedRoute rolesAutorises={['AGENT_GESTION', 'AGENT_RECETTE']}><NotificationsAgentPage /></ProtectedRoute>} />

        {/* Responsable */}
        <Route path="/responsable/dashboard" element={<ProtectedRoute rolesAutorises={['RESPONSABLE', 'ADMIN']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/responsable/indicateurs" element={<ProtectedRoute rolesAutorises={['RESPONSABLE', 'ADMIN']}><IndicateursPage /></ProtectedRoute>} />
        <Route path="/responsable/retards" element={<ProtectedRoute rolesAutorises={['RESPONSABLE', 'ADMIN']}><RetardsPage /></ProtectedRoute>} />
        <Route path="/responsable/recouvrement" element={<ProtectedRoute rolesAutorises={['RESPONSABLE', 'ADMIN']}><RecouvrementPage /></ProtectedRoute>} />
        <Route path="/responsable/rapports" element={<ProtectedRoute rolesAutorises={['RESPONSABLE', 'ADMIN']}><RapportsPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/utilisateurs" element={<ProtectedRoute rolesAutorises={['ADMIN']}><UtilisateursPage /></ProtectedRoute>} />
        <Route path="/admin/roles" element={<ProtectedRoute rolesAutorises={['ADMIN']}><RolesPage /></ProtectedRoute>} />
        <Route path="/admin/types-impots" element={<ProtectedRoute rolesAutorises={['ADMIN']}><TypesImpotsPage /></ProtectedRoute>} />
        <Route path="/admin/jours-feries" element={<ProtectedRoute rolesAutorises={['ADMIN']}><JoursFeriesPage /></ProtectedRoute>} />
        <Route path="/admin/parametres" element={<ProtectedRoute rolesAutorises={['ADMIN']}><ParametresPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
