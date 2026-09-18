import api from './api';

const obligationService = {
  lister: async () => (await api.get('/api/obligations')).data,
  parId: async (id) => (await api.get(`/api/obligations/${id}`)).data,
  parContribuable: async (nif) => (await api.get(`/api/obligations/contribuable/${nif}`)).data,
  parAgent: async (idAgent) => (await api.get(`/api/obligations/agent/${idAgent}`)).data,
  retards: async () => (await api.get('/api/obligations/retards')).data,
  echeancesProches: async (jours = 7) =>
    (await api.get(`/api/obligations/echeances-proches?jours=${jours}`)).data,
  generer: async (nif, codeImpot, periodeFiscale) =>
    (await api.post('/api/obligations/generer', { nif, codeImpot, periodeFiscale })).data,
  affecterAgent: async (id, idAgent) =>
    (await api.put(`/api/obligations/${id}/affecter/${idAgent}`)).data,
};

export default obligationService;
