import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { routesAccessibles } from '../../routes/configRoutes';
import { correspondARecherche } from '../../utils/recherche';

export default function CommandPalette() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();
  const [ouvert, setOuvert] = useState(false);
  const [requete, setRequete] = useState('');
  const [indexActif, setIndexActif] = useState(0);
  const inputRef = useRef(null);
  const declencheurRef = useRef(null);
  const idListe = useId();
  const routes = useMemo(() => routesAccessibles(utilisateur?.role), [utilisateur?.role]);

  const resultats = useMemo(() => {
    if (!requete.trim()) return routes.slice(0, 12);
    return routes
      .filter((route) =>
        correspondARecherche(
          `${route.titre} ${route.libelleMenu || ''} ${route.chemin}`,
          requete,
          [(valeur) => valeur],
        ),
      )
      .slice(0, 12);
  }, [requete, routes]);

  useEffect(() => {
    const surTouche = (evenement) => {
      const cible = evenement.target;
      const saisie =
        cible instanceof HTMLElement &&
        (cible.tagName === 'INPUT' ||
          cible.tagName === 'TEXTAREA' ||
          cible.tagName === 'SELECT' ||
          cible.isContentEditable);
      const raccourci = (evenement.ctrlKey || evenement.metaKey) && evenement.key.toLowerCase() === 'k';
      const barreOblique = evenement.key === '/' && !saisie && !evenement.ctrlKey && !evenement.metaKey;

      if (raccourci || barreOblique) {
        evenement.preventDefault();
        declencheurRef.current = cible;
        setOuvert(true);
        setRequete('');
        setIndexActif(0);
      }
    };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  }, []);

  useEffect(() => {
    if (!ouvert) return undefined;
    const minuterie = window.setTimeout(() => inputRef.current?.focus(), 20);
    const surEchap = (evenement) => {
      if (evenement.key === 'Escape') setOuvert(false);
    };
    document.addEventListener('keydown', surEchap);
    return () => {
      window.clearTimeout(minuterie);
      document.removeEventListener('keydown', surEchap);
    };
  }, [ouvert]);

  const fermer = () => {
    setOuvert(false);
    setRequete('');
    if (declencheurRef.current instanceof HTMLElement) declencheurRef.current.focus();
  };

  const aller = (route) => {
    if (!route) return;
    navigate(route.chemin);
    fermer();
  };

  const surTouche = (evenement) => {
    if (evenement.key === 'ArrowDown') {
      evenement.preventDefault();
      setIndexActif((index) => Math.min(resultats.length - 1, index + 1));
    } else if (evenement.key === 'ArrowUp') {
      evenement.preventDefault();
      setIndexActif((index) => Math.max(0, index - 1));
    } else if (evenement.key === 'Enter') {
      evenement.preventDefault();
      aller(resultats[indexActif]);
    }
  };

  if (!ouvert) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[#101936]/55 p-4 pt-[12vh]"
      onMouseDown={(evenement) => {
        if (evenement.target === evenement.currentTarget) fermer();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation rapide"
        className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4">
          <Search className="h-[18px] w-[18px] text-slate-500" strokeWidth={1.75} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={idListe}
            aria-activedescendant={resultats[indexActif] ? `${idListe}-${resultats[indexActif].id}` : undefined}
            aria-label="Rechercher une page"
            value={requete}
            onChange={(evenement) => {
              setRequete(evenement.target.value);
              setIndexActif(0);
            }}
            onKeyDown={surTouche}
            placeholder="Rechercher une page, un écran…"
            className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={fermer}
            aria-label="Fermer la navigation rapide"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <ul id={idListe} role="listbox" aria-label="Pages disponibles" className="max-h-[50vh] overflow-y-auto py-2">
          {resultats.map((route, index) => {
            const Icone = route.icone;
            return (
              <li key={route.id}>
                <button
                  type="button"
                  id={`${idListe}-${route.id}`}
                  role="option"
                  aria-selected={index === indexActif}
                  onMouseEnter={() => setIndexActif(index)}
                  onClick={() => aller(route)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm ${
                    index === indexActif ? 'bg-primary/5 text-primary' : 'text-slate-700'
                  }`}
                >
                  {Icone && <Icone className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />}
                  <span className="min-w-0 flex-1 truncate">{route.titre}</span>
                  {index === indexActif && (
                    <CornerDownLeft className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {resultats.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-600">
            Aucune page ne correspond à « {requete} ».
          </p>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          <span>Flèches pour parcourir · Entrée pour ouvrir</span>
          <span>Échap pour fermer</span>
        </div>
      </div>
    </div>
  );
}
