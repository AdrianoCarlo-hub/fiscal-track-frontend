import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const user = authService.getUtilisateur();
    if (user && authService.isAuthentifie()) {
      setUtilisateur(user);
    }
    setChargement(false);
  }, []);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit etre utilise dans un AuthProvider');
  }
  return context;
}
