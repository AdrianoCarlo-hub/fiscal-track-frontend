import { useRef } from 'react';

/**
 * Onglets contrôlés. `onglets` : [{ cle, libelle, compteur? }]
 * Navigation clavier conforme au modèle ARIA : flèches, Home et End.
 */
export default function Tabs({ onglets, actif, onChange, className = '', label = 'Sections' }) {
  const boutonsRef = useRef([]);

  const activer = (index) => {
    const cible = onglets[index];
    if (!cible) return;
    onChange(cible.cle);
    boutonsRef.current[index]?.focus();
  };

  const surTouche = (evenement, index) => {
    if (evenement.key === 'ArrowRight') {
      evenement.preventDefault();
      activer((index + 1) % onglets.length);
    } else if (evenement.key === 'ArrowLeft') {
      evenement.preventDefault();
      activer((index - 1 + onglets.length) % onglets.length);
    } else if (evenement.key === 'Home') {
      evenement.preventDefault();
      activer(0);
    } else if (evenement.key === 'End') {
      evenement.preventDefault();
      activer(onglets.length - 1);
    }
  };

  return (
    <div className={`overflow-x-auto border-b border-slate-200 ${className}`}>
      <div role="tablist" aria-label={label} className="flex min-w-max gap-1">
        {onglets.map((onglet, index) => {
          const selectionne = onglet.cle === actif;
          return (
            <button
              key={onglet.cle}
              ref={(element) => {
                boutonsRef.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`onglet-${onglet.cle}`}
              aria-selected={selectionne}
              aria-controls={`panneau-${onglet.cle}`}
              tabIndex={selectionne ? 0 : -1}
              onClick={() => onChange(onglet.cle)}
              onKeyDown={(evenement) => surTouche(evenement, index)}
              className={[
                'relative flex min-h-11 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                selectionne
                  ? 'text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent'
                  : 'text-slate-600 hover:text-slate-900',
              ].join(' ')}
            >
              {onglet.libelle}
              {onglet.compteur !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    selectionne ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {onglet.compteur}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
