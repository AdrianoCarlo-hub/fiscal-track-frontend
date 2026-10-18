import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requete : ajoute le token JWT a chaque appel
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de reponse : gere les erreurs 401 et 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    if (status === 403) {
      // Acces refuse (role insuffisant) : on ne deconnecte PAS, on affiche un
      // message clair sur l'erreur pour que l'utilisateur puisse revenir.
      if (!error.response.data || !error.response.data.message) {
        error.response = error.response || {};
        error.response.data = { message: "Acces refuse : votre role ne permet pas cette action." };
      }
    }
    return Promise.reject(error);
  }
);

export default api;
