import { Link, useLocation } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { getRouteParRole } from '../routes/roleRoutes';

export default function NotFoundPage() {
  const { utilisateur } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileQuestion className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="fiscal-page-title mt-5 text-2xl font-semibold">Page introuvable</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        L’adresse <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{pathname}</code> ne
        correspond à aucune page de la plateforme.
      </p>
      <Link
        to={utilisateur ? getRouteParRole(utilisateur.role) : '/login'}
        className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
      >
        {utilisateur ? 'Retour à mon espace' : 'Se connecter'}
      </Link>
    </div>
  );
}
