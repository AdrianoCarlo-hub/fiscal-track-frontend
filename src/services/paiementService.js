import api from './api';

const paiementService = {
  lister: async () => (await api.get('/api/paiements')).data,
  parId: async (id) => (await api.get(`/api/paiements/${id}`)).data,
  parCompte: async (idCompte) => (await api.get(`/api/paiements/compte/${idCompte}`)).data,
  resteARecouvrer: async (idCompte) =>
    (await api.get(`/api/paiements/compte/${idCompte}/reste`)).data,
  enregistrer: async (data) => (await api.post('/api/paiements', data)).data,
};

export default paiementService;
