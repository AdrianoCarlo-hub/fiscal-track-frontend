import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { getRouteParRole } from '../routes/roleRoutes';
import { LIBELLES_ROLE } from '../utils/libelles';

export default function NonAutorisePage() {
  const { utilisateur } = useAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
        <ShieldAlert className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="fiscal-page-title mt-5 text-2xl font-semibold">Accès non autorisé</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Cette page n’est pas accessible avec le profil «&nbsp;
        {LIBELLES_ROLE[utilisateur?.role] || 'inconnu'}&nbsp;». Si vous pensez qu’il s’agit d’une
        erreur, contactez l’administrateur de la plateforme.
      </p>
      <Link
        to={getRouteParRole(utilisateur?.role)}
        className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        Retour à mon espace
      </Link>
    </div>
  );
}
