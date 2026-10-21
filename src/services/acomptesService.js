import api from './api';

/**
 * Traduit une erreur de l'API acomptes en message lisible pour l'ecran.
 */
export function messageErreurAcomptes(error) {
  const status = error?.response?.status;
  const serveur = error?.response?.data?.message;
  if (status === 403) {
    return serveur || 'Accès refusé : vous ne pouvez consulter que vos propres acomptes.';
  }
  if (status === 404) {
    return serveur || 'Contribuable introuvable : vérifiez le NIF du dossier.';
  }
  if (status === 400) {
    return serveur || 'Exercice invalide : indiquez une année à quatre chiffres.';
  }
  return serveur || 'Impossible de charger les acomptes. Vérifiez votre connexion puis réessayez.';
}

const acomptesService = {
  lister: async (nif, exercice = new Date().getFullYear()) =>
    (await api.get(`/api/contribuables/${encodeURIComponent(nif)}/acomptes`, {
      params: { exercice },
    })).data,
};

export default acomptesService;
