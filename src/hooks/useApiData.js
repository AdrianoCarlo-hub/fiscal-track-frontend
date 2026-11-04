import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiError, messageErreur } from '../services/api';
import { filtrerListe } from '../utils/recherche';
import { useDebounce } from './useDebounce';

function versApiError(err) {
  return err instanceof ApiError ? err : new ApiError(messageErreur(err));
}

/**
 * Chargement de données avec états explicites.
 * `erreur` est une ApiError (jamais un message brut) ; `recharger` relance
 * sans faire disparaître l'écran (utile après un enregistrement).
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

const TAILLES_PAGE = [10, 25, 50];

/**
 * Filtre et pagine une liste déjà chargée. La recherche porte uniquement sur
 * les champs déclarés par la page, avec debounce et gestion des accents.
 * Les paramètres peuvent être conservés dans l'URL via `cleUrl`.
 */
export function useListView(data = [], pageSize = 10, options = {}) {
  const { champs = [], cleUrl = null, tailleInitiale = pageSize } = options;
  const [parametres, setParametres] = useSearchParams();
  const prefixe = cleUrl ? `${cleUrl}.` : '';
  const cleQuery = `${prefixe}q`;
  const clePage = `${prefixe}page`;
  const cleTaille = `${prefixe}taille`;

  const [queryLocal, setQueryLocal] = useState('');
  const [pageLocale, setPageLocale] = useState(0);
  const [tailleLocale, setTailleLocale] = useState(
    TAILLES_PAGE.includes(tailleInitiale) ? tailleInitiale : 10,
  );

  const query = cleUrl ? parametres.get(cleQuery) || '' : queryLocal;
  const page = cleUrl ? Number(parametres.get(clePage) || 0) : pageLocale;
  const taille = cleUrl
    ? Number(parametres.get(cleTaille) || tailleLocale)
    : tailleLocale;

  const queryDebouncee = useDebounce(query, 200);
  const source = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const filtered = useMemo(
    () => filtrerListe(source, queryDebouncee, champs),
    [source, queryDebouncee, champs],
  );

  const totalPages = Math.ceil(filtered.length / taille);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const debut = safePage * taille;

  const ecrireUrl = useCallback(
    (modifications) => {
      if (!cleUrl) return;
      setParametres(
        (precedents) => {
          const suivants = new URLSearchParams(precedents);
          Object.entries(modifications).forEach(([cle, valeur]) => {
            if (valeur === '' || valeur === null || valeur === undefined) suivants.delete(cle);
            else suivants.set(cle, String(valeur));
          });
          return suivants;
        },
        { replace: true },
      );
    },
    [cleUrl, setParametres],
  );

  const setQuery = useCallback(
    (valeur) => {
      if (cleUrl) ecrireUrl({ [cleQuery]: valeur, [clePage]: '' });
      else {
        setQueryLocal(valeur);
        setPageLocale(0);
      }
    },
    [cleUrl, clePage, cleQuery, ecrireUrl],
  );

  const setPage = useCallback(
    (valeur) => {
      if (cleUrl) ecrireUrl({ [clePage]: valeur > 0 ? valeur : '' });
      else setPageLocale(Math.max(0, valeur));
    },
    [cleUrl, clePage, ecrireUrl],
  );

  const setTaille = useCallback(
    (valeur) => {
      if (cleUrl) ecrireUrl({ [cleTaille]: valeur, [clePage]: '' });
      else {
        setTailleLocale(valeur);
        setPageLocale(0);
      }
    },
    [cleUrl, clePage, cleTaille, ecrireUrl],
  );

  const clear = useCallback(() => setQuery(''), [setQuery]);

  const reinitialiser = useCallback(() => {
    setQuery('');
    setPage(0);
  }, [setPage, setQuery]);

  return {
    query,
    setQuery,
    clear,
    filtered,
    filteredCount: filtered.length,
    total: source.length,
    items: filtered.slice(debut, debut + taille),
    page: safePage,
    setPage,
    taille,
    setTaille,
    tailles: TAILLES_PAGE,
    pagination:
      filtered.length > 0
        ? {
            page: safePage,
            totalPages: Math.max(1, totalPages),
            totalElements: filtered.length,
            size: taille,
          }
        : null,
    reinitialiser,
  };
}

/**
 * Pagination serveur pour les endpoints `/paginated`. Dès qu'une recherche
 * est saisie, le hook charge l'ensemble des données pour filtrer localement
 * sur les champs déclarés, afin de ne jamais limiter la recherche à la page.
 */
export function useListePaginee(chargerPage, chargerTout, options = {}) {
  const { champs = [], cleUrl = null, tailleInitiale = 10 } = options;
  const [parametres, setParametres] = useSearchParams();
  const prefixe = cleUrl ? `${cleUrl}.` : '';
  const cleQuery = `${prefixe}q`;
  const clePage = `${prefixe}page`;
  const cleTaille = `${prefixe}taille`;

  const [queryLocale, setQueryLocale] = useState('');
  const query = cleUrl ? parametres.get(cleQuery) || '' : queryLocale;
  const queryDebouncee = useDebounce(query, 250);
  const [pageLocale, setPageLocale] = useState(0);
  const [tailleLocale, setTailleLocale] = useState(tailleInitiale);
  const page = cleUrl ? Number(parametres.get(clePage) || 0) : pageLocale;
  const taille = cleUrl ? Number(parametres.get(cleTaille) || tailleLocale) : tailleLocale;

  const chargerPageRef = useRef(chargerPage);
  const chargerToutRef = useRef(chargerTout);
  const champsRef = useRef(champs);
  useEffect(() => {
    chargerPageRef.current = chargerPage;
    chargerToutRef.current = chargerTout;
    champsRef.current = champs;
  });

  const [etat, setEtat] = useState({
    chargement: true,
    erreur: null,
    contenu: [],
    total: 0,
    totalPages: 1,
    modeRecherche: false,
  });
  const [rafraichir, setRafraichir] = useState(0);

  const ecrireUrl = useCallback(
    (modifications) => {
      if (!cleUrl) return;
      setParametres(
        (precedents) => {
          const suivants = new URLSearchParams(precedents);
          Object.entries(modifications).forEach(([cle, valeur]) => {
            if (valeur === '' || valeur === null || valeur === undefined) suivants.delete(cle);
            else suivants.set(cle, String(valeur));
          });
          return suivants;
        },
        { replace: true },
      );
    },
    [cleUrl, setParametres],
  );

  const setQuery = useCallback(
    (valeur) => {
      if (cleUrl) ecrireUrl({ [cleQuery]: valeur, [clePage]: '' });
      else {
        setQueryLocale(valeur);
        setPageLocale(0);
      }
    },
    [cleUrl, clePage, cleQuery, ecrireUrl],
  );

  useEffect(() => {
    let annule = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- indicateur de chargement demandé par l'écran
    setEtat((precedent) => ({ ...precedent, chargement: true, erreur: null }));

    async function charger() {
      try {
        if (queryDebouncee.trim()) {
          const tout = await chargerToutRef.current();
          if (annule) return;
          const liste = Array.isArray(tout) ? tout : [];
          setEtat({
            chargement: false,
            erreur: null,
            contenu: filtrerListe(liste, queryDebouncee, champsRef.current),
            total: liste.length,
            totalPages: Math.max(1, Math.ceil(liste.length / taille)),
            modeRecherche: true,
          });
          return;
        }
        const resultat = await chargerPageRef.current(page, taille);
        if (annule) return;
        const contenu = resultat?.content || [];
        setEtat({
          chargement: false,
          erreur: null,
          contenu,
          total: resultat?.totalElements ?? contenu.length,
          modeRecherche: false,
        });
      } catch (err) {
        if (!annule) {
          setEtat({ chargement: false, erreur: versApiError(err), contenu: [], total: 0, totalPages: 1, modeRecherche: false });
        }
      }
    }

    charger();
    return () => {
      annule = true;
    };
  }, [page, taille, queryDebouncee, rafraichir]);

  const totalPages = etat.modeRecherche
    ? Math.max(1, Math.ceil(etat.contenu.length / taille))
    : Math.max(1, etat.totalPages);
  const safePage = Math.min(page, totalPages - 1);

  const items = useMemo(() => {
    if (!etat.modeRecherche) return etat.contenu;
    const debut = safePage * taille;
    return etat.contenu.slice(debut, debut + taille);
  }, [etat.contenu, etat.modeRecherche, safePage, taille]);

  return {
    query,
    setQuery,
    items,
    filtered: etat.contenu,
    filteredCount: etat.modeRecherche ? etat.contenu.length : etat.total,
    total: etat.total,
    page: safePage,
    setPage: (valeur) => {
      if (cleUrl) ecrireUrl({ [clePage]: valeur > 0 ? valeur : '' });
      else setPageLocale(valeur);
    },
    taille,
    setTaille: (valeur) => {
      if (cleUrl) ecrireUrl({ [cleTaille]: valeur === tailleInitiale ? '' : valeur, [clePage]: '' });
      else {
        setTailleLocale(valeur);
        setPageLocale(0);
      }
    },
    tailles: TAILLES_PAGE,
    chargement: etat.chargement,
    erreur: etat.erreur,
    recharger: () => setRafraichir((valeur) => valeur + 1),
    pagination:
      etat.total > 0
        ? {
            page: safePage,
            totalPages,
            totalElements: etat.modeRecherche ? etat.contenu.length : etat.total,
            size: taille,
          }
        : null,
    reinitialiser: () => setQuery(''),
    clear: () => setQuery(''),
  };
}
