export default function ParametresPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Parametres du systeme</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div>
          <h2 className="font-bold text-slate-800">Regles metier actives</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>RC1 - Report des echeances aux jours ouvrables</li>
            <li>RC4-RC7 - Calcul des penalites selon la taille d entreprise</li>
            <li>RC12 - Reste a recouvrer calcule automatiquement</li>
            <li>RC17-RC18 - Rappels J-7, J-1, J+1, J+8</li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-slate-800">Configuration technique</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>Backend : Spring Boot 3.3.5</li>
            <li>Base de donnees : PostgreSQL 16</li>
            <li>Authentification : JWT HS384</li>
            <li>Frontend : React 18 + Vite</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
