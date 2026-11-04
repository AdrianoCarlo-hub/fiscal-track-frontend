export {
  ROUTE_PAR_ROLE,
  getRouteParRole,
  titrePage,
  routePourPath,
  filArianePourPath,
  menuPourRole,
  routesAccessibles,
  ROUTES,
  ROUTES_PAR_ID,
  GROUPES_MENU,
} from './configRoutes';

import { ROUTES } from './configRoutes';

export const TITRES_PAGES = ROUTES.map((route) => [route.chemin, route.titre]);
