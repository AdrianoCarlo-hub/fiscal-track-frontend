import api from './api';

const adminService = {
  // Utilisateurs
  listerUtilisateurs: async () => (await api.get('/api/admin/utilisateurs')).data,
  utilisateurParId: async (id) => (await api.get(`/api/admin/utilisateurs/${id}`)).data,
  ajouterUtilisateur: async (data) => (await api.post('/api/admin/utilisateurs', data)).data,
  modifierUtilisateur: async (id, data) => (await api.put(`/api/admin/utilisateurs/${id}`, data)).data,
  supprimerUtilisateur: async (id) => (await api.delete(`/api/admin/utilisateurs/${id}`)).data,

  // Jours feries
  listerJoursFeries: async () => (await api.get('/api/admin/jours-feries')).data,
  joursFeriesParAnnee: async (annee) =>
    (await api.get(`/api/admin/jours-feries/${annee}`)).data,
  ajouterJourFerie: async (data) => (await api.post('/api/admin/jours-feries', data)).data,
  supprimerJourFerie: async (id) => (await api.delete(`/api/admin/jours-feries/${id}`)).data,

  // Parametres fiscaux (BLOC 4.3)
  listerParametres: async () => (await api.get('/api/admin/parametres-fiscaux')).data,
  parametreParCode: async (code) => (await api.get(`/api/admin/parametres-fiscaux/${code}`)).data,
  modifierParametre: async (code, data) => (await api.put(`/api/admin/parametres-fiscaux/${code}`, data)).data,
};

export default adminService;
