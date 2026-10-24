import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, messageErreur } from '../services/api';

function versApiError(err) {
  return err instanceof ApiError ? err : new ApiError(messageErreur(err));
}

/**
 * Chargement de donnees avec etats explicites.
 * `erreur` est une ApiError (jamais un message brut) ; `recharger` relance
 * sans faire disparaitre l'ecran (utile apres un enregistrement).
 */
export function useApiData(fetchFn, dependances = [], { valeurInitiale = null } = {}) {
  const [etat, setEtat] = useState({ signature: null, data: valeurInitiale, erreur: null });
  const fetchRef = useRef(fetchFn);

  useEffect(() => {
    fetchRef.current = fetchFn;
  });

  const cle = JSON.stringify(dependances);

  useEffect(() => {
    let annule = false;
    fetchRef
      .current()
      .then((resultat) => {
        if (!annule) setEtat({ signature: cle, data: resultat, erreur: null });
      })
      .catch((err) => {
        if (!annule) {
          setEtat({ signature: cle, data: valeurInitiale, erreur: versApiError(err) });
        }
      });
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  const recharger = useCallback(async () => {
    try {
      const resultat = await fetchRef.current();
      setEtat((precedent) => ({ ...precedent, data: resultat, erreur: null }));
      return resultat;
    } catch (err) {
      setEtat((precedent) => ({ ...precedent, erreur: versApiError(err) }));
      return null;
    }
  }, []);

  return {
    data: etat.data,
    chargement: etat.signature !== cle,
    erreur: etat.erreur,
    recharger,
  };
}

export default useApiData;

/** Filtre et pagine cote client une liste deja chargee en entier. */
export function useListView(data = [], pageSize = 10) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const source = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fr');
    if (!needle) return source;
    return source.filter((item) =>
      JSON.stringify(item ?? {}).toLocaleLowerCase('fr').includes(needle),
    );
  }, [source, query]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));

  return {
    query,
    setQuery: (value) => {
      setQuery(value);
      setPage(0);
    },
    clear: () => {
      setQuery('');
      setPage(0);
    },
    setPage,
    items: filtered.slice(safePage * pageSize, (safePage + 1) * pageSize),
    filteredCount: filtered.length,
    pagination:
      totalPages > 1
        ? { page: safePage, totalPages, totalElements: filtered.length, size: pageSize }
        : null,
  };
}
