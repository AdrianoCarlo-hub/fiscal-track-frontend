import api from './api';

const declarationService = {
  lister: async () => (await api.get('/api/declarations')).data,
  parId: async (id) => (await api.get(`/api/declarations/${id}`)).data,
  parObligation: async (idObligation) =>
    (await api.get(`/api/declarations/obligation/${idObligation}`)).data,
  parStatut: async (statut) => (await api.get(`/api/declarations/statut/${statut}`)).data,
  deposer: async (data) => (await api.post('/api/declarations', data)).data,
  valider: async (id) => (await api.put(`/api/declarations/${id}/valider`)).data,
  rejeter: async (id) => (await api.put(`/api/declarations/${id}/rejeter`)).data,
};

export default declarationService;
