/**
 * Composant de pagination reutilisable.
 * Affiche : Premier / Precedent / numeros / Suivant / Dernier.
 *
 * Props :
 *   page : number (0-indexed)
 *   totalPages : number
 *   totalElements : number
 *   size : number
 *   onChange : (nouvellePage) => void
 */
export default function Pagination({ page, totalPages, totalElements, size, onChange }) {
  if (totalPages <= 1) return null;

  const premiereLigne = page * size + 1;
  const derniereLigne = Math.min((page + 1) * size, totalElements);

  const pagesVisibles = () => {
    const pages = [];
    const debut = Math.max(0, page - 2);
    const fin = Math.min(totalPages - 1, page + 2);
    for (let i = debut; i <= fin; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-600">
        {premiereLigne}-{derniereLigne} sur {totalElements}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <button
          onClick={() => onChange(0)}
          disabled={page === 0}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          «
        </button>
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Précédent
        </button>

        {pagesVisibles().map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm transition ${
              p === page
                ? 'border-primary bg-primary text-white'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p + 1}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant
        </button>
        <button
          onClick={() => onChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          »
        </button>
      </div>
    </div>
  );
}
