import { TAILLES_PAGE } from '../../utils/referentiels';

/**
 * Pagination réutilisable : Premier / Précédent / pages / Suivant / Dernier.
 * `page` est indexée à partir de 0.
 */
export default function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onChange,
  onTailleChange,
  tailles = TAILLES_PAGE,
}) {
  const afficherTailles = typeof onTailleChange === 'function';
  if (totalPages <= 1 && !afficherTailles) return null;

  const premiereLigne = totalElements === 0 ? 0 : page * size + 1;
  const derniereLigne = Math.min((page + 1) * size, totalElements);

  const pagesVisibles = () => {
    const pages = [];
    const debut = Math.max(0, page - 2);
    const fin = Math.min(totalPages - 1, page + 2);
    for (let index = debut; index <= fin; index += 1) pages.push(index);
    return pages;
  };

  const classeBouton =
    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav
      aria-label="Pagination des résultats"
      className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span aria-live="polite">
          {totalElements === 0 ? 'Aucun résultat' : `${premiereLigne} à ${derniereLigne} sur ${totalElements}`}
        </span>
        {afficherTailles && (
          <label className="flex items-center gap-2 text-xs text-slate-600">
            Lignes par page
            <select
              value={size}
              onChange={(evenement) => onTailleChange(Number(evenement.target.value))}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {tailles.map((valeur) => (
                <option key={valeur} value={valeur}>
                  {valeur}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" onClick={() => onChange(0)} disabled={page === 0} className={classeBouton} aria-label="Première page">
            <span aria-hidden="true">«</span>
          </button>
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page === 0}
            className={classeBouton}
            aria-label="Page précédente"
          >
            Précédent
          </button>

          {pagesVisibles().map((numero) => (
            <button
              key={numero}
              type="button"
              onClick={() => onChange(numero)}
              aria-label={`Page ${numero + 1}`}
              aria-current={numero === page ? 'page' : undefined}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                numero === page
                  ? 'border-primary bg-primary font-semibold text-white'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {numero + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={page >= totalPages - 1}
            className={classeBouton}
            aria-label="Page suivante"
          >
            Suivant
          </button>
          <button
            type="button"
            onClick={() => onChange(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className={classeBouton}
            aria-label="Dernière page"
          >
            <span aria-hidden="true">»</span>
          </button>
        </div>
      )}
    </nav>
  );
}
