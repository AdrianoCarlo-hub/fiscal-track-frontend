import api from './api';

const authService = {
  login: async (identifiant, motDePasse) => {
    const response = await api.post('/api/auth/login', {
      identifiant,
      motDePasse,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
  },

  getUtilisateur: () => {
    const user = localStorage.getItem('utilisateur');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem('token'),

  isAuthentifie: () => !!localStorage.getItem('token'),
};

export default authService;
