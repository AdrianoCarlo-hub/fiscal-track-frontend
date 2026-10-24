import { useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getRouteParRole } from '../../routes/roleRoutes';
import { messageErreur } from '../../services/api';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [sessionExpiree, setSessionExpiree] = useState(() => {
    const drapeau = sessionStorage.getItem('session-expiree') === '1';
    if (drapeau) sessionStorage.removeItem('session-expiree');
    return drapeau;
  });
  const [chargement, setChargement] = useState(false);

  const navigate = useNavigate();
  const { login, utilisateur } = useAuth();

  if (utilisateur) {
    return <Navigate to={getRouteParRole(utilisateur.role)} replace />;
  }

  const handleSubmit = async (evenement) => {
    evenement.preventDefault();
    if (chargement) return;
    setErreur(null);
    setChargement(true);
    try {
      const session = await login(identifiant.trim(), motDePasse);
      navigate(getRouteParRole(session.role), { replace: true });
    } catch (err) {
      setErreur(
        err?.statut === 401 || err?.statut === 400
          ? 'Identifiant ou mot de passe incorrect. Vérifiez vos informations puis réessayez.'
          : messageErreur(err, 'La connexion a échoué. Veuillez réessayer.'),
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F3F5F8] p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(30,39,97,0.12)] md:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between bg-primary p-8 text-white md:p-10">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Centre fiscal
            </div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight">Fiscal-Track</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
              Plateforme de gestion fiscale, de suivi des obligations et de traitement des
              déclarations.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Mission
              </p>
              <p className="mt-2 text-lg font-semibold">
                Suivi fiable des contribuables et des obligations fiscales
              </p>
            </div>
            <p className="border-l-2 border-accent pl-4 text-sm leading-6 text-white/75">
              Un espace sécurisé pour consulter vos obligations et suivre le traitement de vos
              démarches fiscales.
            </p>
          </div>
        </section>

        <section className="bg-white p-8 md:p-10">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRound className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Connexion</h2>
            <p className="mt-2 text-sm text-slate-500">Accès sécurisé au centre fiscal</p>
          </div>

          {sessionExpiree && (
            <Alert variante="avertissement" titre="Session expirée" className="mb-5" onFermer={() => setSessionExpiree(false)}>
              Votre session a expiré pour des raisons de sécurité. Reconnectez-vous pour continuer.
            </Alert>
          )}

          {erreur && (
            <Alert variante="danger" titre="Connexion impossible" className="mb-5" onFermer={() => setErreur(null)}>
              {erreur}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="identifiant" className="mb-2 block text-sm font-medium text-slate-700">
                Identifiant ou NIF <span className="text-danger">*</span>
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <UserRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  id="identifiant"
                  name="identifiant"
                  type="text"
                  value={identifiant}
                  onChange={(evenement) => setIdentifiant(evenement.target.value)}
                  placeholder="0000000001 ou agent@impots.mg"
                  autoComplete="username"
                  autoFocus
                  required
                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mot-de-passe" className="mb-2 block text-sm font-medium text-slate-700">
                Mot de passe <span className="text-danger">*</span>
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <KeyRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  id="mot-de-passe"
                  name="motDePasse"
                  type={motDePasseVisible ? 'text' : 'password'}
                  value={motDePasse}
                  onChange={(evenement) => setMotDePasse(evenement.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label={motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={motDePasseVisible}
                  onClick={() => setMotDePasseVisible((visible) => !visible)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary"
                >
                  {motDePasseVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              chargement={chargement}
              disabled={!identifiant.trim() || !motDePasse}
            >
              {chargement ? 'Connexion en cours…' : 'Se connecter'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
            En cas d’oubli de vos identifiants, contactez votre centre fiscal.
          </p>
        </section>
      </div>
    </div>
  );
}
