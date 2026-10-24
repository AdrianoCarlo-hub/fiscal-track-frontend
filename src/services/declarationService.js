import api from './api';

const declarationService = {
  lister: async () => (await api.get('/api/declarations')).data,
  listerPagine: async (page = 0, size = 20) =>
    (await api.get('/api/declarations/paginated', { params: { page, size } })).data,

  parId: async (id) => (await api.get(`/api/declarations/${id}`)).data,
  parObligation: async (idObligation) =>
    (await api.get(`/api/declarations/obligation/${idObligation}`)).data,
  parContribuable: async (nif) =>
    (await api.get(`/api/declarations/contribuable/${encodeURIComponent(nif)}`)).data,
  parStatut: async (statut) => (await api.get(`/api/declarations/statut/${statut}`)).data,
  deposer: async (data) => (await api.post('/api/declarations', data)).data,
  previsualiser: async (data) => (await api.post('/api/declarations/preview', data)).data,
  valider: async (id) => (await api.put(`/api/declarations/${id}/valider`)).data,
  rejeter: async (id, motif) => (await api.put(`/api/declarations/${id}/rejeter`, { motif })).data,
};

export default declarationService;
