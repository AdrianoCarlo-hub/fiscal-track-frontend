import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox, Search, X } from 'lucide-react';
import Pagination from './Pagination';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import LoadingState from '../ui/LoadingState';

export function ListToolbar({
  value,
  onChange,
  placeholder = 'Rechercher dans la liste…',
  labelRecherche = 'Rechercher dans la liste',
  count,
  actions,
  filtresActifs = [],
  onReinitialiser,
}) {
  const aDesFiltres = filtresActifs.length > 0 || Boolean(value);

  return (
    <div className="mb-4 space-y-2.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-lg sm:flex-row sm:items-center">
          <label className="relative block w-full">
            <span className="sr-only">{labelRecherche}</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={value}
              onChange={(evenement) => onChange(evenement.target.value)}
              placeholder={placeholder}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {value && (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => onChange('')}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </label>
          {actions}
        </div>
        {count !== undefined && (
          <span className="shrink-0 text-sm text-slate-600" aria-live="polite">
            {count} résultat{count > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {(filtresActifs.length > 0 || onReinitialiser) && aDesFiltres && (
        <div className="flex flex-wrap items-center gap-2">
          {filtresActifs.map((filtre) => (
            <span
              key={filtre.cle}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700"
            >
              <span className="font-medium">{filtre.libelle}</span>
              <span>{filtre.valeur}</span>
              <button
                type="button"
                onClick={filtre.onRetirer}
                aria-label={`Retirer le filtre ${filtre.libelle}`}
                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-100 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          {onReinitialiser && (
            <button
              type="button"
              onClick={onReinitialiser}
              className="text-xs font-medium text-primary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function valeurCellule(item, colonne) {
  if (colonne.render) return colonne.render(item);
  return item?.[colonne.cle] ?? '—';
}

/**
 * Tableau générique : chargement, erreur, vide, tri, défilement et cartes mobiles.
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
  tri,
  onTri,
  titreTableau = 'Résultats',
}) {
  const [triInterne, setTriInterne] = useState(null);
  const triUtilise = tri || triInterne;
  const lignes = useMemo(() => (Array.isArray(donnees) ? donnees : []), [donnees]);

  const lignesTriees = useMemo(() => {
    if (!triUtilise?.cle) return lignes;
    const colonne = colonnes.find((element) => element.cle === triUtilise.cle);
    if (!colonne) return lignes;
    return [...lignes].sort((a, b) => {
      const valeurA = colonne.valeurTri ? colonne.valeurTri(a) : a?.[triUtilise.cle];
      const valeurB = colonne.valeurTri ? colonne.valeurTri(b) : b?.[triUtilise.cle];
      if (valeurA === valeurB) return 0;
      if (valeurA === null || valeurA === undefined) return 1;
      if (valeurB === null || valeurB === undefined) return -1;
      const comparaison =
        typeof valeurA === 'number' && typeof valeurB === 'number'
          ? valeurA - valeurB
          : String(valeurA).localeCompare(String(valeurB), 'fr', { sensitivity: 'base', numeric: true });
      return triUtilise.direction === 'desc' ? -comparaison : comparaison;
    });
  }, [colonnes, lignes, triUtilise]);

  if (chargement) return <LoadingState lignes={4} />;
  if (erreur) return <ErrorState erreur={erreur} onReessayer={onReessayer} />;

  if (lignes.length === 0) {
    return (
      <EmptyState
        icon={rechercheActive ? Search : Inbox}
        title={titreVide || (rechercheActive ? 'Aucun résultat pour cette recherche' : 'Aucune donnée à afficher')}
        description={
          descriptionVide ||
          (rechercheActive
            ? 'Vérifiez l’orthographe ou élargissez les critères de recherche.'
            : 'Aucun élément ne correspond aux critères actuels.')
        }
        action={
          rechercheActive && onEffacerRecherche ? (
            <button
              type="button"
              onClick={onEffacerRecherche}
              className="text-sm font-semibold text-primary underline underline-offset-2"
            >
              Effacer la recherche
            </button>
          ) : null
        }
      />
    );
  }

  const basculerTri = (colonne) => {
    if (!colonne.triable) return;
    const direction = triUtilise?.cle === colonne.cle && triUtilise.direction === 'asc' ? 'desc' : 'asc';
    const suivant = { cle: colonne.cle, direction };
    if (onTri) onTri(suivant);
    else setTriInterne(suivant);
  };

  const cleDeLigne = (item, index) =>
    (cleLigne && cleLigne(item)) || item?.id || item?.idDeclaration || item?.idNotif || index;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="hidden max-h-[70vh] overflow-auto md:block">
        <table className="min-w-full text-sm">
          <caption className="sr-only">{titreTableau}</caption>
          <thead className="sticky top-0 z-10 bg-[#F3F5F8] text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              {colonnes.map((colonne) => {
                const triActif = triUtilise?.cle === colonne.cle;
                const ariaSort = triActif ? (triUtilise.direction === 'asc' ? 'ascending' : 'descending') : 'none';
                return (
                  <th
                    key={colonne.cle}
                    scope="col"
                    aria-sort={colonne.triable ? ariaSort : undefined}
                    className={`whitespace-nowrap px-4 py-3 ${colonne.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {colonne.triable ? (
                      <button
                        type="button"
                        onClick={() => basculerTri(colonne)}
                        className={`inline-flex items-center gap-1.5 rounded-sm uppercase tracking-wide hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          colonne.align === 'right' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {colonne.label}
                        {triActif ? (
                          triUtilise.direction === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      colonne.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {lignesTriees.map((item, index) => (
              <tr
                key={cleDeLigne(item, index)}
                className="transition-colors duration-150 hover:bg-[#F7F8FA]"
              >
                {colonnes.map((colonne) => (
                  <td
                    key={colonne.cle}
                    className={`px-4 py-3 align-middle ${colonne.align === 'right' ? 'text-right' : 'text-left'} ${
                      colonne.classe || ''
                    }`}
                  >
                    {valeurCellule(item, colonne)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {lignesTriees.map((item, index) => (
          <li key={cleDeLigne(item, index)} className="p-4">
            <dl className="space-y-2">
              {colonnes.map((colonne) => (
                <div key={colonne.cle} className="flex items-start justify-between gap-4 text-sm">
                  <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {colonne.label}
                  </dt>
                  <dd className={`min-w-0 text-right text-slate-800 ${colonne.classe || ''}`}>
                    {valeurCellule(item, colonne)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {pagination && (pagination.totalPages > 1 || pagination.onTailleChange) && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          size={pagination.size}
          onChange={onPageChange || pagination.onChange}
          onTailleChange={pagination.onTailleChange}
        />
      )}
    </div>
  );
}
