import { useEffect, useState } from 'react';
import obligationService from '../../services/obligationService';

export default function RetardsPage() {
  const [obligations, setObligations] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    obligationService.retards()
      .then(setObligations)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Obligations en retard</h1>
      <p className="text-slate-500 text-sm mb-6">{obligations.length} obligation(s) en retard</p>

      {chargement ? <p>Chargement...</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">NIF</th>
                <th className="text-left px-4 py-3">Impot</th>
                <th className="text-left px-4 py-3">Periode</th>
                <th className="text-left px-4 py-3">Echeance</th>
                <th className="text-left px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {obligations.map((o) => (
                <tr key={o.idObligationFiscale}>
                  <td className="px-4 py-3 font-mono text-sm">{o.nif}</td>
                  <td className="px-4 py-3">{o.codeImpot}</td>
                  <td className="px-4 py-3">{o.periodeFiscale}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{o.dateLimiteReelle}</td>
                  <td className="px-4 py-3">
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">RETARD</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
