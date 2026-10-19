import { useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getRouteParRole } from '../../routes/roleRoutes';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const user = await login(identifiant, motDePasse);
      navigate(getRouteParRole(user.role));
    } catch (err) {
      if (err.response?.status === 401) {
        setErreur('Identifiant ou mot de passe incorrect');
      } else {
        setErreur(err.response?.data?.message || 'Erreur de connexion');
      }
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F5F8] p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(30,39,97,0.12)] md:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between bg-deep p-8 text-white md:p-10">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
              <ShieldCheck className="h-4 w-4" />
              Centre fiscal
            </div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight">Fiscal-Track</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-200">
              Plateforme de gestion fiscale, de suivi des obligations et de traitement des déclarations.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">Mission</p>
              <p className="mt-2 text-lg font-semibold">Suivi fiable des contribuables et des obligations fiscales</p>
            </div>
            <div className="border-l-2 border-[#C9A227] pl-4 text-sm leading-6 text-slate-200">Un espace sécurisé pour consulter vos obligations et suivre le traitement de vos démarches fiscales.</div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRound className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Connexion</h2>
            <p className="mt-2 text-sm text-slate-500">Accès sécurisé au centre fiscal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Identifiant</label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <UserRound className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="NIF0000001 ou agent@impots.mg"
                  required
                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Mot de passe</label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <KeyRound className="h-4 w-4 text-slate-400" />
                <input
                  type={motDePasseVisible ? 'text' : 'password'}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-800 focus:outline-none"
                />
                <button type="button" aria-label={motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={motDePasseVisible} onClick={() => setMotDePasseVisible((visible) => !visible)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary">
                  {motDePasseVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {erreur && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erreur}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={chargement}>
              {chargement ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-500">
              <p className="mb-2 font-semibold uppercase tracking-[0.12em] text-slate-500">Comptes de test</p>
              <ul className="space-y-1">
                <li>NIF0000001 / password123</li>
                <li>rakoto.jean@impots.mg</li>
                <li>andry.lova@impots.mg</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
