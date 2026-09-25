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
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
      <div className="text-sm text-slate-600">
        {premiereLigne}-{derniereLigne} sur {totalElements}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(0)}
          disabled={page === 0}
          className="px-2 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          «
        </button>
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Precedent
        </button>

        {pagesVisibles().map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1 text-sm border rounded ${
              p === page
                ? 'bg-sky-500 text-white border-sky-500'
                : 'border-slate-300 hover:bg-slate-50'
            }`}
          >
            {p + 1}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
        <button
          onClick={() => onChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          className="px-2 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          »
        </button>
      </div>
    </div>
  );
}
