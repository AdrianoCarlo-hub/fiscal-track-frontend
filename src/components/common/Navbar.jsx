import { useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Button from '../ui/Button';

const notifications = [
  { id: 1, title: 'Déclaration reçue', detail: 'La déclaration IR-2025 a été validée.', time: 'Il y a 12 min', tone: 'info' },
  { id: 2, title: 'Échéance proche', detail: 'Paiement de TVA dans 48h.', time: 'Aujourd’hui', tone: 'warning' },
  { id: 3, title: 'Règlement reçu', detail: 'Un paiement de 3 200 000 Ar a été enregistré.', time: 'Hier', tone: 'success' },
];

export default function Navbar({ onToggleMenu }) {
  const { utilisateur, logout } = useAuth();
  const [openNotifications, setOpenNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (utilisateur?.identifiant || 'CF')
    .split(' ')
    .map((segment) => segment[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={onToggleMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

      </div>

      <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 md:flex">
        <Search className="h-4 w-4" />
        <input
          aria-label="Rechercher"
          placeholder="Rechercher"
          className="w-52 border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setOpenNotifications((value) => !value)}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          {openNotifications && (
            <div className="absolute right-0 top-14 z-20 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-sm font-semibold text-slate-800">Notifications</p>
                <span className="text-[11px] font-medium text-primary">3 nouveaux</span>
              </div>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                      <span className={`h-2.5 w-2.5 rounded-full ${notification.tone === 'info' ? 'bg-primary' : notification.tone === 'warning' ? 'bg-warning' : notification.tone === 'success' ? 'bg-success' : 'bg-danger'}`} />
                    </div>
                    <p className="text-xs text-slate-600">{notification.detail}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-slate-400">{notification.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-800">{utilisateur?.identifiant || 'Agent fiscal'}</p>
            <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">{utilisateur?.role || 'UTILISATEUR'}</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
        </div>

        <Button variant="ghost" className="hidden gap-2 sm:inline-flex" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>

        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 sm:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
