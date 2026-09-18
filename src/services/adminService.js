import api from './api';

const adminService = {
  // Utilisateurs
  listerUtilisateurs: async () => (await api.get('/api/admin/utilisateurs')).data,
  utilisateurParId: async (id) => (await api.get(`/api/admin/utilisateurs/${id}`)).data,
  ajouterUtilisateur: async (data) => (await api.post('/api/admin/utilisateurs', data)).data,
  supprimerUtilisateur: async (id) => (await api.delete(`/api/admin/utilisateurs/${id}`)).data,

  // Jours feries
  listerJoursFeries: async () => (await api.get('/api/admin/jours-feries')).data,
  joursFeriesParAnnee: async (annee) =>
    (await api.get(`/api/admin/jours-feries/${annee}`)).data,
  ajouterJourFerie: async (data) => (await api.post('/api/admin/jours-feries', data)).data,
  supprimerJourFerie: async (id) => (await api.delete(`/api/admin/jours-feries/${id}`)).data,
};

export default adminService;
