import { Database, ServerCog, ShieldCheck, Sparkles } from 'lucide-react';

export default function ParametresPage() {
  const regles = [
    'RC1 - Report des échéances aux jours ouvrables',
    'RC4-RC7 - Calcul des pénalités selon la taille d’entreprise',
    'RC12 - Reste à recouvrer calculé automatiquement',
    'RC17-RC18 - Rappels J-7, J-1, J+1, J+8',
  ];

  const config = [
    'Backend : Spring Boot 3.3.5',
    'Base de données : PostgreSQL 16',
    'Authentification : JWT HS384',
    'Frontend : React 19 + Vite',
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Paramètres</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-800">Paramètres du système</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="fiscal-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Règles métier actives</h2>
          </div>
          <ul className="space-y-3 p-5 text-sm text-slate-600">
            {regles.map((regle) => (
              <li key={regle} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <span>{regle}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="fiscal-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <ServerCog className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Configuration technique</h2>
          </div>
          <ul className="space-y-3 p-5 text-sm text-slate-600">
            {config.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="fiscal-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-amber-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Système de sécurité</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">JWT</p>
            <p className="mt-2 text-xl font-bold text-slate-800">HS384</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Sessions</p>
            <p className="mt-2 text-xl font-bold text-slate-800">8h</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Stockage</p>
            <p className="mt-2 text-xl font-bold text-slate-800">Local + API</p>
          </div>
        </div>
      </div>
    </div>
  );
}
