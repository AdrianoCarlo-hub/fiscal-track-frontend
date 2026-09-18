import api from './api';

const typeImpotService = {
  lister: async () => (await api.get('/api/types-impots')).data,
  parCode: async (code) => (await api.get(`/api/types-impots/${code}`)).data,
  creer: async (data) => (await api.post('/api/types-impots', data)).data,
  modifier: async (code, data) => (await api.put(`/api/types-impots/${code}`, data)).data,
};

export default typeImpotService;
