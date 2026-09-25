import { useState, useEffect, useCallback } from 'react';

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
