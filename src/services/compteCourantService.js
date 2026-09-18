import api from './api';

const compteCourantService = {
  lister: async () => (await api.get('/api/comptes')).data,
  parId: async (id) => (await api.get(`/api/comptes/${id}`)).data,
  parContribuable: async (nif) => (await api.get(`/api/comptes/contribuable/${nif}`)).data,
  nonSoldes: async () => (await api.get('/api/comptes/non-soldes')).data,
};

export default compteCourantService;
