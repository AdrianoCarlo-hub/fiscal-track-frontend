import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Erreur normalisee de l'API : le message est toujours lisible en francais,
 * `champs` contient les erreurs de validation par champ renvoyees par le
 * backend (Phase 0), `statut` le code HTTP.
 */
export class ApiError extends Error {
  constructor(message, { statut = 0, champs = {}, donnees = null, cause = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statut = statut;
    this.champs = champs || {};
    this.donnees = donnees;
    this.cause = cause;
  }

  estValidation() {
    return this.statut === 400 && Object.keys(this.champs).length > 0;
  }

  estAccesRefuse() {
    return this.statut === 403;
  }
}

const MESSAGE_RESEAU =
  'Impossible de joindre le serveur. Vérifiez votre connexion, puis réessayez.';
const MESSAGE_INATTENDU =
  'Une erreur inattendue est survenue. Réessayez dans quelques instants.';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

/** Evenement emis quand la session expire : l'AuthProvider ecoute et deconnecte. */
export const EVENEMENT_SESSION_EXPIREE = 'fiscal-track:session-expiree';

export function messageErreur(error, repli = MESSAGE_INATTENDU) {
  if (error instanceof ApiError) return error.message;
  return error?.message || repli;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new ApiError(MESSAGE_RESEAU, { cause: error }));
    }

    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      if (window.location.pathname !== '/login') {
        window.dispatchEvent(new CustomEvent(EVENEMENT_SESSION_EXPIREE));
      }
      return Promise.reject(
        new ApiError(data?.message || 'Votre session a expiré. Reconnectez-vous.', {
          statut: status,
          donnees: data,
          cause: error,
        }),
      );
    }

    const message =
      data?.message ||
      (status === 403
        ? "Accès refusé : votre profil ne permet pas cette action."
        : status >= 500
          ? 'Le serveur a rencontré une erreur. Réessayez dans quelques instants.'
          : repliPourStatut(status));

    return Promise.reject(
      new ApiError(message, {
        statut: status,
        champs: data?.champs || {},
        donnees: data,
        cause: error,
      }),
    );
  },
);

function repliPourStatut(status) {
  if (status === 400) return 'Les informations saisies sont invalides.';
  if (status === 404) return 'Élément introuvable.';
  if (status === 409) return 'Cette opération entre en conflit avec des données existantes.';
  return MESSAGE_INATTENDU;
}

export default api;
