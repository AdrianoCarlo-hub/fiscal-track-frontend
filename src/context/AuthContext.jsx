import { useState } from 'react';
import authService from '../services/authService';
import { AuthContext } from './useAuth';


export function AuthProvider({ children }) {
  // Lecture synchrone du stockage local : pas d'effet ni de rendu de chargement.
  const [utilisateur, setUtilisateur] = useState(() => {
    const user = authService.getUtilisateur();
    return user && authService.isAuthentifie() ? user : null;
  });
  const [chargement] = useState(false);

  const login = async (identifiant, motDePasse) => {
    const data = await authService.login(identifiant, motDePasse);
    localStorage.setItem('token', data.token);
    const user = {
      identifiant: data.identifiant,
      role: data.role,
      type: data.type,
    };
    localStorage.setItem('utilisateur', JSON.stringify(user));
    setUtilisateur(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setUtilisateur(null);
  };

  const estConnecte = () => !!utilisateur;

  const aRole = (roles) => {
    if (!utilisateur) return false;
    const listeRoles = Array.isArray(roles) ? roles : [roles];
    return listeRoles.includes(utilisateur.role);
  };

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, login, logout, estConnecte, aRole }}>
      {children}
    </AuthContext.Provider>
  );
}
