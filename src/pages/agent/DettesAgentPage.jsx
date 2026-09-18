import { useEffect, useState } from 'react';
import compteCourantService from '../../services/compteCourantService';

export default function DettesAgentPage() {
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

  const total = comptes.reduce((acc, c) => acc + Number(c.resteARecouvrer || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Suivi des dettes</h1>

      <div className="bg-red-500 text-white p-6 rounded-xl shadow-sm mb-6">
        <p className="text-sm uppercase text-red-100">Total a recouvrer</p>
        <p className="text-3xl font-bold mt-2">{formatMontant(total)}</p>
        <p className="text-sm mt-1">{comptes.length} compte(s) non solde(s)</p>
      </div>

      {chargement ? <p>Chargement...</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">Compte</th>
                <th className="text-left px-4 py-3">NIF</th>
                <th className="text-right px-4 py-3">Total du</th>
                <th className="text-right px-4 py-3">Reste</th>
                <th className="text-left px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comptes.map((c) => (
                <tr key={c.idCompte} className="hover:bg-slate-50">
                  <td className="px-4 py-3">#{c.idCompte}</td>
                  <td className="px-4 py-3 font-mono text-sm">{c.nif}</td>
                  <td className="px-4 py-3 text-right">{formatMontant(c.montantTotalDu)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{formatMontant(c.resteARecouvrer)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      c.statutRecouvrement === 'TITRE_EMIS' ? 'bg-orange-100 text-orange-700' :
                      c.statutRecouvrement === 'ATD_LANCE' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{c.statutRecouvrement}</span>
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
