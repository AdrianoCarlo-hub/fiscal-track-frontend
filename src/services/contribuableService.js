import api from './api';

const contribuableService = {
  lister: async () => (await api.get('/api/contribuables')).data,

  listerPagine: async (page = 0, size = 20, sort = null) => {
    const params = { page, size };
    if (sort) params.sort = sort;
    return (await api.get('/api/contribuables/paginated', { params })).data;
  },

  parNif: async (nif) => (await api.get(`/api/contribuables/${nif}`)).data,

  rechercher: async (q) => (await api.get(`/api/contribuables/search?q=${q}`)).data,

  rechercherPagine: async (q, page = 0, size = 20) =>
    (await api.get('/api/contribuables/search/paginated', {
      params: { q, page, size },
    })).data,

  creer: async (data) => (await api.post('/api/contribuables', data)).data,
  modifier: async (nif, data) => (await api.put(`/api/contribuables/${nif}`, data)).data,
  modifierPreferencesContact: async (nif, data) =>
    (await api.put(`/api/contribuables/${nif}/preferences-contact`, data)).data,
  acomptes: async (nif, exercice) =>
    (await api.get(`/api/contribuables/${encodeURIComponent(nif)}/acomptes`, {
      params: { exercice },
    })).data,
};

export default contribuableService;
