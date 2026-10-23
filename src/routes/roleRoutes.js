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

/** Titres affiches dans l'en-tete, du chemin le plus specifique au plus general. */
export const TITRES_PAGES = [
  ['/contribuable/declarations/deposer', 'Déposer une déclaration'],
  ['/contribuable/calendrier', 'Calendrier fiscal'],
  ['/contribuable/obligations', 'Mes obligations fiscales'],
  ['/contribuable/declarations', 'Mes déclarations'],
  ['/contribuable/paiements', 'Mes paiements'],
  ['/contribuable/dettes', 'Mes dettes fiscales'],
  ['/contribuable/acomptes', 'Mes acomptes'],
  ['/contribuable/notifications', 'Mes notifications'],
  ['/contribuable/profil', 'Mon profil'],
  ['/agent/dossiers', 'Dossiers contribuables'],
  ['/agent/declarations', 'Instruction des déclarations'],
  ['/agent/paiements', 'Paiements enregistrés'],
  ['/agent/dettes', 'Suivi des dettes'],
  ['/agent/notifications', 'Notifications et rappels'],
  ['/agent/simulateur', 'Simulateur fiscal'],
  ['/responsable/dashboard', 'Tableau de bord'],
  ['/responsable/retards', 'Obligations en retard'],
  ['/responsable/recouvrement', 'Suivi du recouvrement'],
  ['/responsable/rapports', 'Rapports et exports'],
  ['/admin/utilisateurs', 'Gestion des utilisateurs'],
  ['/admin/roles', 'Rôles et permissions'],
  ['/admin/types-impots', 'Types d’impôts'],
  ['/admin/jours-feries', 'Jours fériés'],
  ['/admin/parametres', 'Paramètres fiscaux'],
  ['/admin/modeles-notifications', 'Modèles de notifications'],
  ['/admin/journal-audit', 'Journal d’audit'],
];

export function titrePage(pathname) {
  const trouve = TITRES_PAGES.find(([chemin]) => pathname.startsWith(chemin));
  return trouve ? trouve[1] : 'Fiscal-Track';
}
