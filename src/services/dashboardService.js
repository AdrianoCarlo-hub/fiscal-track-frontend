import api from './api';

const dashboardService = {
  indicateurs: async () => (await api.get('/api/dashboard/indicateurs')).data,
  top10Restes: async () => (await api.get('/api/dashboard/top10-restes')).data,
};

export default dashboardService;
