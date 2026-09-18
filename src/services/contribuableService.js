import api from './api';

const contribuableService = {
  lister: async () => (await api.get('/api/contribuables')).data,
  parNif: async (nif) => (await api.get(`/api/contribuables/${nif}`)).data,
  rechercher: async (q) => (await api.get(`/api/contribuables/search?q=${q}`)).data,
  creer: async (data) => (await api.post('/api/contribuables', data)).data,
  modifier: async (nif, data) => (await api.put(`/api/contribuables/${nif}`, data)).data,
};

export default contribuableService;
