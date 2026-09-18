import api from './api';

const notificationService = {
  lister: async () => (await api.get('/api/notifications')).data,
  parId: async (id) => (await api.get(`/api/notifications/${id}`)).data,
  parContribuable: async (nif) => (await api.get(`/api/notifications/contribuable/${nif}`)).data,
  parStatut: async (statut) => (await api.get(`/api/notifications/statut/${statut}`)).data,
  genererRappels: async (jours = 7) =>
    (await api.post(`/api/notifications/generer-rappels?jours=${jours}`)).data,
  envoyerEnAttente: async () =>
    (await api.post('/api/notifications/envoyer-en-attente')).data,
  envoyerUne: async (id) => (await api.post(`/api/notifications/${id}/envoyer`)).data,
};

export default notificationService;
