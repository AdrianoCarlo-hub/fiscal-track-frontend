import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Conserve les filtres dans la query string pour restituer le même écran
 * après un rechargement ou depuis un lien partagé.
 */
export function useFiltresUrl(valeursParDefaut = {}) {
  const [parametres, setParametres] = useSearchParams();
  const cleDefauts = JSON.stringify(valeursParDefaut);
  const defauts = useMemo(() => JSON.parse(cleDefauts), [cleDefauts]);

  const filtres = useMemo(() => {
    const resultat = {};
    Object.entries(defauts).forEach(([cle, defaut]) => {
      const valeur = parametres.get(cle);
      resultat[cle] = valeur === null ? defaut : valeur;
    });
    return resultat;
  }, [parametres, defauts]);

  const mettreAJour = useCallback(
    (modifications) => {
      setParametres(
        (precedents) => {
          const suivants = new URLSearchParams(precedents);
          Object.entries(modifications).forEach(([cle, valeur]) => {
            if (valeur === '' || valeur === null || valeur === undefined || valeur === defauts[cle]) {
              suivants.delete(cle);
            } else {
              suivants.set(cle, String(valeur));
            }
          });
          return suivants;
        },
        { replace: true },
      );
    },
    [setParametres, defauts],
  );

  const setFiltre = useCallback(
    (cle, valeur) => mettreAJour({ [cle]: valeur }),
    [mettreAJour],
  );

  const reinitialiser = useCallback(() => {
    setParametres(
      (precedents) => {
        const suivants = new URLSearchParams(precedents);
        Object.keys(defauts).forEach((cle) => suivants.delete(cle));
        return suivants;
      },
      { replace: true },
    );
  }, [setParametres, defauts]);

  return { filtres, setFiltre, mettreAJour, reinitialiser };
}

export default useFiltresUrl;
