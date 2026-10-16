import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook generique pour charger des donnees depuis une API.
 * Gere automatiquement le chargement, les erreurs et le rechargement.
 *
 * Utilisation :
 *   const { data, chargement, erreur, recharger } = useApiData(
 *     () => contribuableService.lister(),
 *     []
 *   );
 */
export function useApiData(fetchFn, dependances = []) {
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur('');
    try {
      const resultat = await fetchFn();
      setData(resultat);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setChargement(false);
    }
  }, dependances);

  useEffect(() => {
    charger();
  }, [charger]);

  return { data, chargement, erreur, recharger: charger };
}

export default useApiData;

// Filtre et pagine côté client les listes déjà chargées en entier.
export function useListView(data = [], pageSize = 10) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fr');
    return needle ? data.filter((item) => JSON.stringify(item ?? {}).toLocaleLowerCase('fr').includes(needle)) : data;
  }, [data, query]);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const clear = () => {
    setQuery('');
    setPage(0);
  };

  return {
    query,
    setQuery: (value) => { setQuery(value); setPage(0); },
    clear,
    page: safePage,
    setPage,
    items: filtered.slice(safePage * pageSize, (safePage + 1) * pageSize),
    filteredCount: filtered.length,
    pagination: totalPages > 1 ? { page: safePage, totalPages, totalElements: filtered.length, size: pageSize } : null,
  };
}
