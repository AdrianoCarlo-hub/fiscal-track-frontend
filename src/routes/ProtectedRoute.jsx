import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Garde d'acces : redirige vers la connexion si la session est absente, vers
 * la page « acces non autorise » si le role ne correspond pas. Le backend
 * verifie de toute facon chaque appel.
 */
export default function ProtectedRoute({ children, rolesAutorises }) {
  const { utilisateur } = useAuth();
  const location = useLocation();

  if (!utilisateur) {
    return <Navigate to="/login" replace state={{ depuis: location.pathname }} />;
  }

  if (rolesAutorises && rolesAutorises.length > 0 && !rolesAutorises.includes(utilisateur.role)) {
    return <Navigate to="/non-autorise" replace />;
  }

  return children;
}
