import { useCallback, useRef, useState } from 'react';
import { ApiError, messageErreur } from '../services/api';

/**
 * Gere une soumission : bouton desactive pendant l'appel, erreurs de
 * validation par champ, message global, succes.
 */
export function useAsyncAction(action, { onSucces } = {}) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [champs, setChamps] = useState({});
  const [succes, setSucces] = useState(null);
  const enCoursRef = useRef(false);

  const executer = useCallback(
    async (...args) => {
      if (enCoursRef.current) return null;
      enCoursRef.current = true;
      setEnCours(true);
      setErreur(null);
      setChamps({});
      setSucces(null);
      try {
        const resultat = await action(...args);
        setSucces(resultat ?? true);
        if (onSucces) await onSucces(resultat);
        return resultat;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError(messageErreur(err));
        setErreur(apiError);
        setChamps(apiError.champs || {});
        return null;
      } finally {
        enCoursRef.current = false;
        setEnCours(false);
      }
    },
    [action, onSucces],
  );

  const reinitialiser = useCallback(() => {
    setErreur(null);
    setChamps({});
    setSucces(null);
  }, []);

  return { executer, enCours, erreur, champs, succes, reinitialiser };
}

export default useAsyncAction;
