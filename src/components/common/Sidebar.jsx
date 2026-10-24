import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeftRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileText,
  Folder,
  Landmark,
  LayoutDashboard,
  LogOut,
  Mail,
  ScrollText,
  Settings,
  User,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { LIBELLES_ROLE } from '../../utils/libelles';

const MENUS = {
  CONTRIBUABLE: [
    {
      titre: 'Mon espace fiscal',
      elements: [
        ['/contribuable/calendrier', 'Calendrier fiscal', CalendarDays],
        ['/contribuable/obligations', 'Mes obligations', ClipboardList],
        ['/contribuable/declarations', 'Mes déclarations', FileText],
        ['/contribuable/paiements', 'Mes paiements', CreditCard],
        ['/contribuable/dettes', 'Mes dettes', AlertCircle],
        ['/contribuable/acomptes', 'Mes acomptes', Landmark],
      ],
    },
    {
      titre: 'Mon compte',
      elements: [
        ['/contribuable/notifications', 'Mes notifications', Bell],
        ['/contribuable/profil', 'Mon profil', User],
      ],
    },
  ],
  AGENT_GESTION: [
    {
      titre: 'Gestion des dossiers',
      elements: [
        ['/agent/dossiers', 'Dossiers contribuables', Folder],
        ['/agent/declarations', 'Instruction des déclarations', FileText],
      ],
    },
    {
      titre: 'Communication',
      elements: [
        ['/agent/notifications', 'Notifications et rappels', Bell],
        ['/agent/simulateur', 'Simulateur fiscal', Wallet],
      ],
    },
  ],
  AGENT_RECETTE: [
    {
      titre: 'Recette',
      elements: [
        ['/agent/dossiers', 'Dossiers contribuables', Folder],
        ['/agent/paiements', 'Paiements enregistrés', CreditCard],
        ['/agent/dettes', 'Suivi des dettes', AlertCircle],
      ],
    },
    {
      titre: 'Communication',
      elements: [['/agent/notifications', 'Notifications et rappels', Bell]],
    },
  ],
  RESPONSABLE: [
    {
      titre: 'Pilotage fiscal',
      elements: [
        ['/responsable/dashboard', 'Tableau de bord', LayoutDashboard],
        ['/responsable/retards', 'Obligations en retard', AlertCircle],
        ['/responsable/recouvrement', 'Recouvrement', ArrowLeftRight],
        ['/responsable/rapports', 'Rapports et exports', FileBarChart],
      ],
    },
    {
      titre: 'Outils',
      elements: [
        ['/agent/notifications', 'Notifications et rappels', Bell],
        ['/agent/simulateur', 'Simulateur fiscal', Wallet],
      ],
    },
  ],
  ADMIN: [
    {
      titre: 'Vue générale',
      elements: [['/responsable/dashboard', 'Tableau de bord', LayoutDashboard]],
    },
    {
      titre: 'Administration',
      elements: [
        ['/admin/utilisateurs', 'Utilisateurs', Users],
        ['/admin/roles', 'Rôles et permissions', UserCog],
        ['/admin/types-impots', 'Types d’impôts', Wallet],
        ['/admin/jours-feries', 'Jours fériés', CalendarDays],
        ['/admin/parametres', 'Paramètres fiscaux', Settings],
        ['/admin/modeles-notifications', 'Modèles de notifications', Mail],
        ['/admin/journal-audit', 'Journal d’audit', ScrollText],
      ],
    },
    {
      titre: 'Outils',
      elements: [['/agent/simulateur', 'Simulateur fiscal', Wallet]],
    },
  ],
};

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { utilisateur, logout } = useAuth();
  const [reduit, setReduit] = useState(false);
  const navigate = useNavigate();
  const menus = MENUS[utilisateur?.role] || [];
  const initiales = (utilisateur?.identifiant || 'FT').slice(0, 2).toUpperCase();

  const deconnexion = () => {
    logout();
    onClose?.();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer la navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#101936]/55 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col border-r border-white/10 bg-primary text-white shadow-xl transition-[width,transform] duration-200 md:sticky md:top-0 md:z-auto md:translate-x-0 ${
          reduit ? 'w-[5.25rem]' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex min-h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            {!reduit && (
              <div className="min-w-0">
                <p className="truncate font-serif text-lg font-semibold">Fiscal-Track</p>
                <p className="truncate text-[11px] text-white/70">Centre fiscal · Madagascar</p>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label={reduit ? 'Développer la navigation' : 'Réduire la navigation'}
            onClick={() => setReduit((valeur) => !valeur)}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white md:flex"
          >
            {reduit ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label="Fermer la navigation"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Navigation principale" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {menus.map((menu) => (
            <section key={menu.titre}>
              {!reduit && (
                <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                  {menu.titre}
                </h2>
              )}
              <ul className="space-y-1">
                {menu.elements.map(([chemin, libelle, Icone]) => (
                  <li key={chemin}>
                    <NavLink
                      to={chemin}
                      onClick={onClose}
                      title={reduit ? libelle : undefined}
                      aria-label={reduit ? libelle : undefined}
                      className={({ isActive }) =>
                        [
                          'group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                          reduit ? 'justify-center px-2' : '',
                          isActive
                            ? 'border-l-[3px] border-accent bg-white/15 font-semibold text-white'
                            : 'text-white/75 hover:bg-white/10 hover:text-white',
                        ].join(' ')
                      }
                    >
                      <Icone className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      {!reduit && <span className="truncate">{libelle}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className={`mb-2 flex items-center gap-3 rounded-lg bg-white/5 p-2 ${reduit ? 'justify-center' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
              {initiales}
            </span>
            {!reduit && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{utilisateur?.identifiant}</p>
                <p className="truncate text-xs text-white/60">
                  {LIBELLES_ROLE[utilisateur?.role] || 'Compte'}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={deconnexion}
            title={reduit ? 'Déconnexion' : undefined}
            className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white ${
              reduit ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!reduit && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
