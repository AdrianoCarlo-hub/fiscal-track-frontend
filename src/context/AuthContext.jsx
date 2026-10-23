import { useCallback, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import { EVENEMENT_SESSION_EXPIREE } from '../services/api';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => authService.getUtilisateur());

  useEffect(() => {
    const surExpiration = () => {
      authService.logout();
      setUtilisateur(null);
      sessionStorage.setItem('session-expiree', '1');
    };
    window.addEventListener(EVENEMENT_SESSION_EXPIREE, surExpiration);
    return () => window.removeEventListener(EVENEMENT_SESSION_EXPIREE, surExpiration);
  }, []);

  const login = useCallback(async (identifiant, motDePasse) => {
    const session = await authService.login(identifiant, motDePasse);
    setUtilisateur(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUtilisateur(null);
  }, []);

  const aRole = useCallback(
    (roles) => {
      if (!utilisateur) return false;
      const liste = Array.isArray(roles) ? roles : [roles];
      return liste.includes(utilisateur.role);
    },
    [utilisateur],
  );

  const valeur = useMemo(
    () => ({
      utilisateur,
      chargement: false,
      login,
      logout,
      estConnecte: !!utilisateur,
      aRole,
    }),
    [utilisateur, login, logout, aRole],
  );

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}
