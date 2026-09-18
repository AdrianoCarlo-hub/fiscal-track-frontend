export const ROUTE_PAR_ROLE = {
  CONTRIBUABLE: '/contribuable/calendrier',
  AGENT_GESTION: '/agent/dossiers',
  AGENT_RECETTE: '/agent/paiements',
  RESPONSABLE: '/responsable/dashboard',
  ADMIN: '/admin/utilisateurs',
};

export function getRouteParRole(role) {
  return ROUTE_PAR_ROLE[role] || '/login';
}
