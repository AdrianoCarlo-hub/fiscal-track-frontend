import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import notificationService, { EVENEMENT_NOTIFICATIONS_LUES } from '../../services/notificationService';
import { LIBELLES_ROLE } from '../../utils/libelles';
import { titrePage } from '../../routes/roleRoutes';
import CommandPalette from './CommandPalette';

const dateDuJour = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function Header({ onOuvrirMenu }) {
  const { utilisateur } = useAuth();
  const { pathname } = useLocation();
  const [nonLues, setNonLues] = useState(0);
  const [rafraichissement, setRafraichissement] = useState(0);
  const estContribuable = utilisateur?.role === 'CONTRIBUABLE';
  const titre = titrePage(pathname);

  useEffect(() => {
    document.title = `${titre} · Fiscal-Track`;
  }, [titre]);

  useEffect(() => {
    const surMiseAJour = () => setRafraichissement((valeur) => valeur + 1);
    window.addEventListener(EVENEMENT_NOTIFICATIONS_LUES, surMiseAJour);
    return () => window.removeEventListener(EVENEMENT_NOTIFICATIONS_LUES, surMiseAJour);
  }, []);

  useEffect(() => {
    if (!estContribuable || !utilisateur?.identifiant) return undefined;

    let actif = true;
    let minuterie;

    const charger = async () => {
      try {
        const resultat = await notificationService.nonLues(utilisateur.identifiant);
        if (actif) setNonLues(Number(resultat?.nombreNonLues) || 0);
      } catch {
        // Le compteur est un confort : en cas d'erreur on affiche 0 et on
        // reessaie au prochain cycle sans interrompre la navigation.
        if (actif) setNonLues(0);
      }
    };

    charger();
    minuterie = window.setInterval(charger, 60_000);
    return () => {
      actif = false;
      window.clearInterval(minuterie);
    };
  }, [estContribuable, utilisateur?.identifiant, pathname, rafraichissement]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOuvrirMenu}
          aria-label="Ouvrir la navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-primary transition hover:bg-slate-50 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{titre}</p>
          <p className="hidden truncate text-xs text-slate-500 sm:block">
            Direction Générale des Impôts · Centre fiscal
          </p>
        </div>

        <button
          type="button"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="hidden min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex"
          aria-label="Ouvrir la navigation rapide"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden lg:inline">Rechercher</span>
          <kbd className="hidden rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 lg:inline">
            Ctrl K
          </kbd>
        </button>

        <p className="hidden text-xs capitalize text-slate-500 xl:block">{dateDuJour.format(new Date())}</p>

        {estContribuable && (
          <Link
            to="/contribuable/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label={`Notifications${nonLues > 0 ? `, ${nonLues} non lue${nonLues > 1 ? 's' : ''}` : ''}`}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {nonLues > 0 && (
              <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {nonLues > 99 ? '99+' : nonLues}
              </span>
            )}
          </Link>
        )}

        <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {(utilisateur?.identifiant || 'FT').slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="max-w-[12rem] truncate text-xs font-medium text-slate-800">
              {utilisateur?.identifiant}
            </p>
            <p className="text-[11px] text-slate-500">{LIBELLES_ROLE[utilisateur?.role] || ''}</p>
          </div>
        </div>
      </div>
      <CommandPalette />
    </header>
  );
}
