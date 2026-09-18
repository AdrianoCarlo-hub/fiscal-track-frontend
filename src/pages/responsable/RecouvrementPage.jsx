import { useEffect, useState } from 'react';
import compteCourantService from '../../services/compteCourantService';

export default function RecouvrementPage() {
  const [comptes, setComptes] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    compteCourantService.nonSoldes()
      .then(setComptes)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Suivi du recouvrement</h1>
      <p className="text-slate-500 text-sm mb-6">{comptes.length} compte(s) non solde(s)</p>

      {chargement ? <p>Chargement...</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">NIF</th>
                <th className="text-right px-4 py-3">Total du</th>
                <th className="text-right px-4 py-3">Paye</th>
                <th className="text-right px-4 py-3">Reste</th>
                <th className="text-left px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comptes.map((c) => (
                <tr key={c.idCompte} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{c.nif}</td>
                  <td className="px-4 py-3 text-right">{formatMontant(c.montantTotalDu)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatMontant(c.montantPaye)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{formatMontant(c.resteARecouvrer)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">
                      {c.statutRecouvrement}
                    </span>
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
