import { Inbox, Search, X } from 'lucide-react';
import Pagination from './Pagination';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import LoadingState from '../ui/LoadingState';

export function ListToolbar({ value, onChange, placeholder = 'Rechercher dans la liste…', count, actions }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full flex-col gap-2 sm:max-w-lg sm:flex-row sm:items-center">
        <label className="relative block w-full">
          <span className="sr-only">Rechercher</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          {value && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        {actions}
      </div>
      {count !== undefined && (
        <span className="shrink-0 text-sm text-slate-500" aria-live="polite">
          {count} résultat{count > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

/**
 * Tableau generique : chargement, erreur, vide, recherche et pagination.
 *
 * Props :
 *   colonnes : [{ cle, label, align?, render? }]
 *   donnees : array
 *   chargement, erreur (ApiError), onReessayer
 *   pagination : { page, totalPages, totalElements, size, onChange }
 *   rechercheActive, onEffacerRecherche
 *   titreVide, descriptionVide
 */
export default function DataTable({
  colonnes,
  donnees,
  chargement,
  erreur,
  onReessayer,
  pagination,
  onPageChange,
  rechercheActive = false,
  onEffacerRecherche,
  titreVide,
  descriptionVide,
  cleLigne,
}) {
  if (chargement) return <LoadingState lignes={4} />;
  if (erreur) return <ErrorState erreur={erreur} onReessayer={onReessayer} />;

  const lignes = Array.isArray(donnees) ? donnees : [];

  if (lignes.length === 0) {
    return (
      <EmptyState
        icon={rechercheActive ? Search : Inbox}
        title={titreVide || (rechercheActive ? 'Aucun résultat' : 'Aucune donnée')}
        description={
          descriptionVide ||
          (rechercheActive
            ? 'Aucune ligne ne correspond à cette recherche.'
            : 'Aucun élément à afficher pour le moment.')
        }
        action={
          rechercheActive && onEffacerRecherche ? (
            <button
              type="button"
              onClick={onEffacerRecherche}
              className="text-sm font-semibold text-primary underline"
            >
              Effacer la recherche
            </button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[#F3F5F8] text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {colonnes.map((col) => (
                <th
                  key={col.cle}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {lignes.map((item, index) => (
              <tr
                key={(cleLigne && cleLigne(item)) || item?.id || item?.idDeclaration || item?.idNotif || index}
                className="transition-colors hover:bg-[#F7F8FA]"
              >
                {colonnes.map((col) => (
                  <td
                    key={col.cle}
                    className={`px-4 py-3 align-middle ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {col.render ? col.render(item) : (item?.[col.cle] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          size={pagination.size}
          onChange={onPageChange || pagination.onChange}
        />
      )}
    </div>
  );
}
