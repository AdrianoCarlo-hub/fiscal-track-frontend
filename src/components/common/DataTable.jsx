import Pagination from './Pagination';
import EmptyState from '../ui/EmptyState';
import { Search, X } from 'lucide-react';

export function ListToolbar({ value, onChange, placeholder = 'Rechercher dans la liste…', count }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-md">
        <span className="sr-only">Rechercher</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
        {value && <button type="button" aria-label="Effacer la recherche" onClick={() => onChange('')}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary"><X className="h-4 w-4" /></button>}
      </label>
      {count !== undefined && <span className="text-sm text-slate-500">{count} résultat{count > 1 ? 's' : ''}</span>}
    </div>
  );
}

/**
 * Tableau generique avec pagination integree.
 *
 * Props :
 *   colonnes : [{ cle, label, align?, render? }]
 *   donnees : array
 *   chargement : boolean
 *   erreur : string
 *   pagination : { page, totalPages, totalElements, size }
 *   onPageChange : (page) => void
 */
export default function DataTable({
  colonnes,
  donnees,
  chargement,
  erreur,
  pagination,
  onPageChange,
  rechercheActive = false,
  onEffacerRecherche,
}) {
  if (chargement) {
    return (
      <div className="fiscal-card p-8 text-center text-sm text-slate-500">
        Chargement...
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
        {erreur}
      </div>
    );
  }

  if (!donnees || donnees.length === 0) {
    return (
      <div className="fiscal-card p-4">
        <EmptyState
          icon={Search}
          title={rechercheActive ? 'Aucun résultat' : 'Aucune donnée'}
          description={rechercheActive ? 'Aucune ligne ne correspond à cette recherche.' : 'Aucune donnée à afficher pour le moment.'}
          action={rechercheActive && onEffacerRecherche ? (
            <button onClick={onEffacerRecherche} className="font-semibold text-primary underline">Effacer la recherche</button>
          ) : null}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#F3F5F8] text-left text-xs font-semibold text-slate-500">
            <tr>
              {colonnes.map((col) => (
                <th
                  key={col.cle}
                  className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {donnees.map((item, idx) => (
              <tr key={idx} className="transition-colors hover:bg-[#F7F8FA]">
                {colonnes.map((col) => (
                  <td
                    key={col.cle}
                    className={`px-4 py-3 align-middle ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    {col.render ? col.render(item) : item[col.cle]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          size={pagination.size}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}
