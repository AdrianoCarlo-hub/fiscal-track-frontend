/* eslint-disable react-refresh/only-export-components -- fichier de configuration, pas de composant exporté */
import { lazy } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  Bell,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileText,
  Folder,
  Landmark,
  LayoutDashboard,
  Mail,
  ScrollText,
  Settings,
  ShieldCheck,
  User,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import { matchPath } from 'react-router-dom';

const CalendrierPage = lazy(() => import('../pages/contribuable/CalendrierPage'));
const ObligationsPage = lazy(() => import('../pages/contribuable/ObligationsPage'));
const DeclarationsPage = lazy(() => import('../pages/contribuable/DeclarationsPage'));
const DeposerDeclarationPage = lazy(() => import('../pages/contribuable/DeposerDeclarationPage'));
const PaiementsPage = lazy(() => import('../pages/contribuable/PaiementsPage'));
const DettesPage = lazy(() => import('../pages/contribuable/DettesPage'));
const AcomptesPage = lazy(() => import('../pages/contribuable/AcomptesPage'));
const NotificationsPage = lazy(() => import('../pages/contribuable/NotificationsPage'));
const ProfilPage = lazy(() => import('../pages/contribuable/ProfilPage'));

const DossiersPage = lazy(() => import('../pages/agent/DossiersPage'));
const DossierDetailPage = lazy(() => import('../pages/agent/DossierDetailPage'));
const DeclarationsAgentPage = lazy(() => import('../pages/agent/DeclarationsAgentPage'));
const PaiementsAgentPage = lazy(() => import('../pages/agent/PaiementsAgentPage'));
const DettesAgentPage = lazy(() => import('../pages/agent/DettesAgentPage'));
const NotificationsAgentPage = lazy(() => import('../pages/agent/NotificationsAgentPage'));
const SimulateurFiscalPage = lazy(() => import('../pages/agent/SimulateurFiscalPage'));

const DashboardPage = lazy(() => import('../pages/responsable/DashboardPage'));
const RetardsPage = lazy(() => import('../pages/responsable/RetardsPage'));
const RecouvrementPage = lazy(() => import('../pages/responsable/RecouvrementPage'));
const RapportsPage = lazy(() => import('../pages/responsable/RapportsPage'));

const UtilisateursPage = lazy(() => import('../pages/admin/UtilisateursPage'));
const RolesPage = lazy(() => import('../pages/admin/RolesPage'));
const TypesImpotsPage = lazy(() => import('../pages/admin/TypesImpotsPage'));
const JoursFeriesPage = lazy(() => import('../pages/admin/JoursFeriesPage'));
const ParametresPage = lazy(() => import('../pages/admin/ParametresPage'));
const ModelesNotificationsPage = lazy(() => import('../pages/admin/ModelesNotificationsPage'));
const JournalAuditPage = lazy(() => import('../pages/admin/JournalAuditPage'));

export const TOUS_LES_AGENTS = ['AGENT_GESTION', 'AGENT_RECETTE', 'RESPONSABLE', 'ADMIN'];
export const RECETTE = ['AGENT_RECETTE', 'RESPONSABLE', 'ADMIN'];
export const PILOTAGE = ['RESPONSABLE', 'ADMIN'];

export const ROUTES = [
  {
    id: 'calendrier',
    chemin: '/contribuable/calendrier',
    titre: 'Calendrier fiscal',
    libelleMenu: 'Calendrier fiscal',
    icone: CalendarDays,
    roles: ['CONTRIBUABLE'],
    composant: CalendrierPage,
  },
  {
    id: 'obligations',
    chemin: '/contribuable/obligations',
    titre: 'Mes obligations fiscales',
    libelleMenu: 'Mes obligations',
    icone: ClipboardList,
    roles: ['CONTRIBUABLE'],
    composant: ObligationsPage,
  },
  {
    id: 'declarations',
    chemin: '/contribuable/declarations',
    titre: 'Mes déclarations',
    libelleMenu: 'Mes déclarations',
    icone: FileText,
    roles: ['CONTRIBUABLE'],
    composant: DeclarationsPage,
  },
  {
    id: 'deposer',
    chemin: '/contribuable/declarations/deposer/:idObligation',
    titre: 'Déposer une déclaration',
    roles: ['CONTRIBUABLE'],
    composant: DeposerDeclarationPage,
    parent: 'declarations',
    menu: false,
  },
  {
    id: 'paiements',
    chemin: '/contribuable/paiements',
    titre: 'Mes paiements',
    libelleMenu: 'Mes paiements',
    icone: CreditCard,
    roles: ['CONTRIBUABLE'],
    composant: PaiementsPage,
  },
  {
    id: 'dettes',
    chemin: '/contribuable/dettes',
    titre: 'Mes dettes fiscales',
    libelleMenu: 'Mes dettes',
    icone: AlertCircle,
    roles: ['CONTRIBUABLE'],
    composant: DettesPage,
  },
  {
    id: 'acomptes',
    chemin: '/contribuable/acomptes',
    titre: 'Mes acomptes',
    libelleMenu: 'Mes acomptes',
    icone: Landmark,
    roles: ['CONTRIBUABLE'],
    composant: AcomptesPage,
  },
  {
    id: 'notifications',
    chemin: '/contribuable/notifications',
    titre: 'Mes notifications',
    libelleMenu: 'Mes notifications',
    icone: Bell,
    roles: ['CONTRIBUABLE'],
    composant: NotificationsPage,
  },
  {
    id: 'profil',
    chemin: '/contribuable/profil',
    titre: 'Mon profil',
    libelleMenu: 'Mon profil',
    icone: User,
    roles: ['CONTRIBUABLE'],
    composant: ProfilPage,
  },
  {
    id: 'dossiers',
    chemin: '/agent/dossiers',
    titre: 'Dossiers contribuables',
    libelleMenu: 'Dossiers contribuables',
    icone: Folder,
    roles: ['AGENT_GESTION', 'AGENT_RECETTE', 'RESPONSABLE'],
    composant: DossiersPage,
  },
  {
    id: 'dossier',
    chemin: '/agent/dossiers/:nif',
    titre: 'Dossier contribuable',
    roles: ['AGENT_GESTION', 'AGENT_RECETTE', 'RESPONSABLE'],
    composant: DossierDetailPage,
    parent: 'dossiers',
    menu: false,
  },
  {
    id: 'declarationsAgent',
    chemin: '/agent/declarations',
    titre: 'Instruction des déclarations',
    libelleMenu: 'Instruction des déclarations',
    icone: FileText,
    roles: ['AGENT_GESTION', 'AGENT_RECETTE', 'RESPONSABLE'],
    composant: DeclarationsAgentPage,
  },
  {
    id: 'paiementsAgent',
    chemin: '/agent/paiements',
    titre: 'Paiements enregistrés',
    libelleMenu: 'Paiements enregistrés',
    icone: CreditCard,
    roles: RECETTE,
    composant: PaiementsAgentPage,
  },
  {
    id: 'dettesAgent',
    chemin: '/agent/dettes',
    titre: 'Suivi des dettes',
    libelleMenu: 'Suivi des dettes',
    icone: AlertCircle,
    roles: RECETTE,
    composant: DettesAgentPage,
  },
  {
    id: 'notificationsAgent',
    chemin: '/agent/notifications',
    titre: 'Notifications et rappels',
    libelleMenu: 'Notifications et rappels',
    icone: Bell,
    roles: TOUS_LES_AGENTS,
    composant: NotificationsAgentPage,
  },
  {
    id: 'simulateur',
    chemin: '/agent/simulateur',
    titre: 'Simulateur fiscal',
    libelleMenu: 'Simulateur fiscal',
    icone: Wallet,
    roles: TOUS_LES_AGENTS,
    composant: SimulateurFiscalPage,
  },
  {
    id: 'dashboard',
    chemin: '/responsable/dashboard',
    titre: 'Tableau de bord',
    libelleMenu: 'Tableau de bord',
    icone: LayoutDashboard,
    roles: PILOTAGE,
    composant: DashboardPage,
  },
  {
    id: 'retards',
    chemin: '/responsable/retards',
    titre: 'Obligations en retard',
    libelleMenu: 'Obligations en retard',
    icone: AlertCircle,
    roles: RECETTE,
    composant: RetardsPage,
  },
  {
    id: 'recouvrement',
    chemin: '/responsable/recouvrement',
    titre: 'Suivi du recouvrement',
    libelleMenu: 'Recouvrement',
    icone: ArrowLeftRight,
    roles: PILOTAGE,
    composant: RecouvrementPage,
  },
  {
    id: 'rapports',
    chemin: '/responsable/rapports',
    titre: 'Rapports et exports',
    libelleMenu: 'Rapports et exports',
    icone: FileBarChart,
    roles: PILOTAGE,
    composant: RapportsPage,
  },
  {
    id: 'utilisateurs',
    chemin: '/admin/utilisateurs',
    titre: 'Gestion des utilisateurs',
    libelleMenu: 'Utilisateurs',
    icone: Users,
    roles: ['ADMIN'],
    composant: UtilisateursPage,
  },
  {
    id: 'roles',
    chemin: '/admin/roles',
    titre: 'Rôles et permissions',
    libelleMenu: 'Rôles et permissions',
    icone: UserCog,
    roles: ['ADMIN'],
    composant: RolesPage,
  },
  {
    id: 'typesImpots',
    chemin: '/admin/types-impots',
    titre: 'Types d’impôts',
    libelleMenu: 'Types d’impôts',
    icone: Landmark,
    roles: ['ADMIN'],
    composant: TypesImpotsPage,
  },
  {
    id: 'joursFeries',
    chemin: '/admin/jours-feries',
    titre: 'Jours fériés',
    libelleMenu: 'Jours fériés',
    icone: CalendarDays,
    roles: ['ADMIN'],
    composant: JoursFeriesPage,
  },
  {
    id: 'parametres',
    chemin: '/admin/parametres',
    titre: 'Paramètres fiscaux',
    libelleMenu: 'Paramètres fiscaux',
    icone: Settings,
    roles: ['ADMIN'],
    composant: ParametresPage,
  },
  {
    id: 'modeles',
    chemin: '/admin/modeles-notifications',
    titre: 'Modèles de notifications',
    libelleMenu: 'Modèles de notifications',
    icone: Mail,
    roles: ['ADMIN'],
    composant: ModelesNotificationsPage,
  },
  {
    id: 'audit',
    chemin: '/admin/journal-audit',
    titre: 'Journal d’audit',
    libelleMenu: 'Journal d’audit',
    icone: ScrollText,
    roles: ['ADMIN'],
    composant: JournalAuditPage,
  },
];

export const ROUTES_PAR_ID = Object.fromEntries(ROUTES.map((route) => [route.id, route]));

export const GROUPES_MENU = {
  CONTRIBUABLE: [
    {
      titre: 'Mon espace fiscal',
      routes: ['calendrier', 'obligations', 'declarations', 'paiements', 'dettes', 'acomptes'],
    },
    { titre: 'Mon compte', routes: ['notifications', 'profil'] },
  ],
  AGENT_GESTION: [
    { titre: 'Gestion des dossiers', routes: ['dossiers', 'declarationsAgent'] },
    { titre: 'Communication', routes: ['notificationsAgent', 'simulateur'] },
  ],
  AGENT_RECETTE: [
    {
      titre: 'Recette',
      routes: ['dossiers', 'declarationsAgent', 'paiementsAgent', 'dettesAgent', 'retards'],
    },
    { titre: 'Communication', routes: ['notificationsAgent', 'simulateur'] },
  ],
  RESPONSABLE: [
    { titre: 'Pilotage fiscal', routes: ['dashboard', 'retards', 'recouvrement', 'rapports'] },
    { titre: 'Gestion des dossiers', routes: ['dossiers', 'declarationsAgent'] },
    { titre: 'Outils', routes: ['notificationsAgent', 'simulateur'] },
  ],
  ADMIN: [
    { titre: 'Vue générale', routes: ['dashboard'] },
    {
      titre: 'Administration',
      routes: ['utilisateurs', 'roles', 'typesImpots', 'joursFeries', 'parametres', 'modeles', 'audit'],
    },
    {
      titre: 'Outils',
      routes: ['notificationsAgent', 'simulateur'],
    },
  ],
};

export const ROUTE_PAR_ROLE = {
  CONTRIBUABLE: '/contribuable/calendrier',
  AGENT_GESTION: '/agent/dossiers',
  AGENT_RECETTE: '/agent/paiements',
  RESPONSABLE: '/responsable/dashboard',
  ADMIN: '/responsable/dashboard',
};

export function getRouteParRole(role) {
  return ROUTE_PAR_ROLE[role] || '/login';
}

export function menuPourRole(role) {
  return (GROUPES_MENU[role] || [])
    .map((groupe) => ({
      titre: groupe.titre,
      elements: groupe.routes
        .map((id) => ROUTES_PAR_ID[id])
        .filter((route) => route && route.roles.includes(role)),
    }))
    .filter((groupe) => groupe.elements.length > 0);
}

export function routesAccessibles(role) {
  return ROUTES.filter((route) => route.menu !== false && route.roles.includes(role));
}

export function routePourPath(pathname) {
  return [...ROUTES]
    .sort((a, b) => b.chemin.length - a.chemin.length)
    .find((route) => matchPath({ path: route.chemin, end: true }, pathname));
}

export function titrePage(pathname) {
  return routePourPath(pathname)?.titre || 'Fiscal-Track';
}

export function filArianePourPath(pathname) {
  const route = routePourPath(pathname);
  if (!route) return [];
  const fil = [];
  let courant = route;
  const vus = new Set();
  while (courant && !vus.has(courant.id)) {
    vus.add(courant.id);
    fil.unshift({
      libelle: courant.titre,
      to: courant.id === route.id ? undefined : courant.chemin,
    });
    courant = courant.parent ? ROUTES_PAR_ID[courant.parent] : null;
  }
  return fil;
}

export const ROUTE_NON_AUTORISE = {
  chemin: '/non-autorise',
  titre: 'Accès non autorisé',
  icone: ShieldCheck,
};
