import { useEffect, useState } from 'react';
import paiementService from '../../services/paiementService';

export default function PaiementsAgentPage() {
  const [paiements, setPaiements] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    paiementService.lister()
      .then(setPaiements)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Paiements enregistres</h1>

      {chargement ? <p>Chargement...</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Compte</th>
                <th className="text-right px-4 py-3">Montant</th>
                <th className="text-left px-4 py-3">Mode</th>
                <th className="text-left px-4 py-3">Reference</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paiements.map((p) => (
                <tr key={p.idPaiement} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">#{p.idPaiement}</td>
                  <td className="px-4 py-3">#{p.idCompte}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatMontant(p.montantVerse)}</td>
                  <td className="px-4 py-3 text-sm">{p.modePaiement}</td>
                  <td className="px-4 py-3 text-sm font-mono">{p.referenceTransaction || '-'}</td>
                  <td className="px-4 py-3 text-sm">{p.datePaiement?.substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
