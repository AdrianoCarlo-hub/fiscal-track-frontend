import { jwtDecode } from 'jwt-decode';
import api from './api';

function decoderPayload(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

function tokenValide(token) {
  const payload = decoderPayload(token);
  if (!payload) return false;
  if (!payload.exp) return true;
  return payload.exp * 1000 > Date.now();
}

/**
 * Role et identifiant sont lus dans le JWT signe par le serveur, jamais
 * dans une valeur saisie par le navigateur.
 */
export function sessionDepuisToken(token) {
  if (!token || !tokenValide(token)) return null;
  const payload = decoderPayload(token);
  const role = payload.role || payload.authorities?.[0]?.authority?.replace('ROLE_', '');
  const identifiant = payload.sub || payload.identifiant;
  if (!role || !identifiant) return null;
  return { identifiant, role, expiration: payload.exp ? payload.exp * 1000 : null };
}

const CLE_TOKEN = 'token';
const CLE_UTILISATEUR = 'utilisateur';

const authService = {
  login: async (identifiant, motDePasse) => {
    const { data } = await api.post('/api/auth/login', { identifiant, motDePasse });
    const session = sessionDepuisToken(data.token);
    if (!session) {
      throw new Error("La réponse d'authentification est invalide.");
    }
    localStorage.setItem(CLE_TOKEN, data.token);
    localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(session));
    return { ...data, ...session };
  },

  logout: () => {
    localStorage.removeItem(CLE_TOKEN);
    localStorage.removeItem(CLE_UTILISATEUR);
  },

  /** Session restauree uniquement si le JWT est present, lisible et non expire. */
  getUtilisateur: () => {
    const token = localStorage.getItem(CLE_TOKEN);
    const session = sessionDepuisToken(token);
    if (!session) {
      authService.logout();
      return null;
    }
    return session;
  },

  getToken: () => localStorage.getItem(CLE_TOKEN),

  isAuthentifie: () => !!sessionDepuisToken(localStorage.getItem(CLE_TOKEN)),
};

export default authService;
