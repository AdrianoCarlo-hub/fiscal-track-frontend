import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeftRight, Bell, BriefcaseBusiness, Calculator, CalendarDays,
  CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, CreditCard, FileBarChart,
  FileText, Folder, LayoutDashboard, LogOut, Settings, TrendingUp, UserCog, Users, Wallet, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GROUPS = {
  CONTRIBUABLE: [{ title: 'Espace contribuable', items: [
    ['/contribuable/calendrier', 'Calendrier fiscal', CalendarDays], ['/contribuable/obligations', 'Obligations', ClipboardList],
    ['/contribuable/declarations', 'Déclarations', FileText], ['/contribuable/paiements', 'Paiements', CreditCard],
    ['/contribuable/dettes', 'Dettes', AlertCircle], ['/contribuable/notifications', 'Notifications', Bell],
  ] }],
  AGENT_GESTION: [{ title: 'Espace agent', items: [
    ['/agent/dossiers', 'Dossiers', Folder], ['/agent/declarations', 'Déclarations', FileText],
    ['/agent/notifications', 'Notifications', Bell], ['/agent/simulateur', 'Simulateur fiscal', Calculator],
  ] }],
  AGENT_RECETTE: [{ title: 'Espace agent', items: [
    ['/agent/dossiers', 'Dossiers', Folder], ['/agent/paiements', 'Paiements', CreditCard],
    ['/agent/dettes', 'Dettes', AlertCircle], ['/agent/notifications', 'Notifications', Bell],
  ] }],
  RESPONSABLE: [{ title: 'Pilotage fiscal', items: [
    ['/responsable/dashboard', 'Tableau de bord', LayoutDashboard], ['/responsable/indicateurs', 'Indicateurs', TrendingUp],
    ['/responsable/retards', 'Retards', AlertCircle], ['/responsable/recouvrement', 'Recouvrement', ArrowLeftRight],
    ['/responsable/rapports', 'Rapports', FileBarChart], ['/agent/simulateur', 'Simulateur fiscal', Calculator],
  ] }],
  ADMIN: [
    { title: 'Vue générale', items: [['/responsable/dashboard', 'Tableau de bord', LayoutDashboard]] },
    { title: 'Administration', items: [
      ['/admin/utilisateurs', 'Utilisateurs', Users], ['/admin/roles', 'Rôles', UserCog],
      ['/admin/types-impots', 'Types d’impôts', Wallet], ['/admin/jours-feries', 'Jours fériés', BriefcaseBusiness],
      ['/admin/parametres', 'Paramètres', Settings],
    ] },
    { title: 'Outils', items: [['/agent/simulateur', 'Simulateur fiscal', Calculator]] },
  ],
};

const ROLE_LABELS = {
  CONTRIBUABLE: 'Contribuable', AGENT_GESTION: 'Agent · Gestion', AGENT_RECETTE: 'Agent · Recette',
  RESPONSABLE: 'Responsable', ADMIN: 'Administrateur',
};

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { utilisateur, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const groups = GROUPS[utilisateur?.role] || [];
  const initials = (utilisateur?.identifiant || 'FT').slice(0, 2).toUpperCase();

  const closeAndGo = (path) => { onClose?.(); navigate(path); };
  const signOut = () => { logout(); closeAndGo('/login'); };

  return <>
    {mobileOpen && <button type="button" aria-label="Fermer la navigation" onClick={onClose}
      className="fixed inset-0 z-40 bg-[#101936]/55 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh flex-col border-r border-white/10 bg-[#1E2761] text-white shadow-xl transition-[width,transform] duration-200 md:sticky md:top-0 md:z-auto md:translate-x-0 ${collapsed ? 'w-[5.25rem]' : 'w-72'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex min-h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10"><CheckCircle2 className="h-5 w-5" /></span>
          {!collapsed && <div className="min-w-0"><p className="truncate font-serif text-lg font-semibold">Fiscal-Track</p><p className="truncate text-[11px] text-slate-300">Centre fiscal · Madagascar</p></div>}
        </div>
        <button type="button" aria-label={collapsed ? 'Développer la navigation' : 'Réduire la navigation'} onClick={() => setCollapsed((value) => !value)}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white md:flex">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <button type="button" aria-label="Fermer la navigation" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-white/10 md:hidden"><X className="h-4 w-4" /></button>
      </div>

      <nav aria-label="Navigation principale" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {groups.map((group) => <section key={group.title}>
          {!collapsed && <h2 className="mb-2 px-3 text-[10px] font-semibold tracking-[0.12em] text-slate-300">{group.title}</h2>}
          <ul className="space-y-1">{group.items.map(([path, label, Icon]) => <li key={path}>
            <NavLink to={path} end={path.endsWith('/dashboard') || path === '/agent/dossiers'} onClick={onClose}
              title={collapsed ? label : undefined} aria-label={collapsed ? label : undefined}
              className={({ isActive }) => `group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${collapsed ? 'justify-center px-2' : ''} ${isActive ? 'border-l-[3px] border-[#C9A227] bg-white/15 font-semibold text-white' : 'text-slate-200 hover:bg-white/8 hover:text-white'}`}>
              <Icon className="h-[18px] w-[18px] shrink-0" />{!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          </li>)}</ul>
        </section>)}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <div className={`mb-2 flex items-center gap-3 rounded-lg bg-white/5 p-2 ${collapsed ? 'justify-center' : ''}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">{initials}</span>
          {!collapsed && <div className="min-w-0"><p className="truncate text-sm font-medium">{utilisateur?.identifiant || 'Utilisateur'}</p><p className="truncate text-xs text-slate-300">{ROLE_LABELS[utilisateur?.role] || 'Compte'}</p></div>}
        </div>
        <button type="button" onClick={signOut} title={collapsed ? 'Déconnexion' : undefined}
          className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center px-2' : ''}`}>
          <LogOut className="h-[18px] w-[18px] shrink-0" />{!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  </>;
}
