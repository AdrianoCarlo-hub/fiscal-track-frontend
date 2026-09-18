import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import calendrierService from '../../services/calendrierService';

export default function CalendrierPage() {
  const { utilisateur } = useAuth();
  const [obligations, setObligations] = useState([]);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    calendrierService.parContribuableEtAnnee(utilisateur.identifiant, annee)
      .then(setObligations)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [utilisateur.identifiant, annee]);

  const grouperParMois = () => {
    const groupes = {};
    obligations.forEach((o) => {
      const mois = o.dateLimiteReelle.substring(0, 7);
      if (!groupes[mois]) groupes[mois] = [];
      groupes[mois].push(o);
    });
    return groupes;
  };

  const groupes = grouperParMois();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Calendrier fiscal</h1>
        <select value={annee} onChange={(e) => setAnnee(Number(e.target.value))}
          className="px-4 py-2 border border-slate-300 rounded-lg">
          {[2024, 2025, 2026, 2027].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {chargement ? <p>Chargement...</p> : Object.keys(groupes).length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
          Aucune echeance pour {annee}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupes).sort().map(([mois, items]) => (
            <div key={mois} className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-bold text-slate-800 mb-3 capitalize">
                {new Date(mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="space-y-2">
                {items.map((o) => (
                  <div key={o.idObligationFiscale}
                    className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-medium">{o.codeImpot} - {o.periodeFiscale}</p>
                      <p className="text-xs text-slate-500">Echeance : {o.dateLimiteReelle}</p>
                    </div>
                    <StatutBadge statut={o.statutDeclaration} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatutBadge({ statut }) {
  const colors = {
    ATTENTE: 'bg-yellow-100 text-yellow-700',
    DEPOSE: 'bg-green-100 text-green-700',
    RETARD: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full ${colors[statut] || 'bg-slate-100'}`}>
      {statut}
    </span>
  );
}
