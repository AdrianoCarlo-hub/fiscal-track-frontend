/**
 * Onglets controles. `onglets` : [{ cle, libelle, compteur? }]
 */
export default function Tabs({ onglets, actif, onChange, className = '' }) {
  return (
    <div className={`overflow-x-auto border-b border-slate-200 ${className}`}>
      <div role="tablist" aria-label="Sections" className="flex min-w-max gap-1">
        {onglets.map((onglet) => {
          const selectionne = onglet.cle === actif;
          return (
            <button
              key={onglet.cle}
              type="button"
              role="tab"
              id={`onglet-${onglet.cle}`}
              aria-selected={selectionne}
              aria-controls={`panneau-${onglet.cle}`}
              onClick={() => onChange(onglet.cle)}
              className={[
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                selectionne
                  ? 'text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
                  : 'text-slate-500 hover:text-slate-800',
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
