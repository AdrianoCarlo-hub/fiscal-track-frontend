import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MENUS = {
  CONTRIBUABLE: [
    { path: '/contribuable/calendrier', label: 'Calendrier' },
    { path: '/contribuable/obligations', label: 'Obligations' },
    { path: '/contribuable/declarations', label: 'Declarations' },
    { path: '/contribuable/paiements', label: 'Paiements' },
    { path: '/contribuable/dettes', label: 'Dettes' },
    { path: '/contribuable/notifications', label: 'Notifications' },
  ],
  AGENT_GESTION: [
    { path: '/agent/dossiers', label: 'Dossiers' },
    { path: '/agent/declarations', label: 'Declarations' },
    { path: '/agent/notifications', label: 'Notifications' },
  ],
  AGENT_RECETTE: [
    { path: '/agent/dossiers', label: 'Dossiers' },
    { path: '/agent/paiements', label: 'Paiements' },
    { path: '/agent/dettes', label: 'Dettes' },
    { path: '/agent/notifications', label: 'Notifications' },
  ],
  RESPONSABLE: [
    { path: '/responsable/dashboard', label: 'Dashboard' },
    { path: '/responsable/indicateurs', label: 'Indicateurs' },
    { path: '/responsable/retards', label: 'Retards' },
    { path: '/responsable/recouvrement', label: 'Recouvrement' },
    { path: '/responsable/rapports', label: 'Rapports' },
  ],
  ADMIN: [
    { path: '/admin/utilisateurs', label: 'Utilisateurs' },
    { path: '/admin/roles', label: 'Roles' },
    { path: '/admin/types-impots', label: 'Types d impots' },
    { path: '/admin/jours-feries', label: 'Jours feries' },
    { path: '/admin/parametres', label: 'Parametres' },
    { path: '/responsable/dashboard', label: 'Dashboard (vue globale)' },
  ],
};

export default function Sidebar() {
  const { utilisateur } = useAuth();
  const menu = MENUS[utilisateur?.role] || [];

  return (
    <aside className="w-64 bg-slate-800 text-white min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-sky-500 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
