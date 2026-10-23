import { RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';
import { messageErreur } from '../../services/api';

export default function ErrorState({ erreur, onReessayer, titre }) {
  const accesRefuse = erreur?.statut === 403;
  const reseau = erreur?.statut === 0;
  const Icone = accesRefuse ? ShieldAlert : reseau ? WifiOff : RefreshCw;

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-danger/25 bg-danger/5 px-6 py-10 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <Icone className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-800">
        {titre || (accesRefuse ? 'Accès refusé' : reseau ? 'Serveur injoignable' : 'Chargement impossible')}
      </h2>
      <p className="mt-1.5 max-w-md text-sm text-slate-600">{messageErreur(erreur)}</p>
      {onReessayer && !accesRefuse && (
        <button
          type="button"
          onClick={() => onReessayer()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Réessayer
        </button>
      )}
    </div>
  );
}
