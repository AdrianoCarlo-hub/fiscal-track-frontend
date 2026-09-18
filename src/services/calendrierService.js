import api from './api';

const calendrierService = {
  parContribuableEtAnnee: async (nif, annee) =>
    (await api.get(`/api/calendrier/${nif}?annee=${annee}`)).data,
  prochainesEcheances: async (nif, jours = 7) =>
    (await api.get(`/api/calendrier/${nif}/prochaines?jours=${jours}`)).data,
};

export default calendrierService;
