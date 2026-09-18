import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';

export default function RapportsPage() {
  const [top10, setTop10] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    dashboardService.top10Restes()
      .then(setTop10)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  const exporterCSV = () => {
    const lignes = [['NIF', 'Reste a recouvrer', 'Statut']];
    top10.forEach((c) => lignes.push([c.nif, c.resteARecouvrer, c.statutRecouvrement]));
    const csv = lignes.map((l) => l.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top10-restes.csv';
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Rapports et exports</h1>
        <button onClick={exporterCSV}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
          Exporter CSV
        </button>
      </div>

      {chargement ? <p>Chargement...</p> : (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Top 10 restes a recouvrer</h2>
          <ul className="space-y-2">
            {top10.map((c) => (
              <li key={c.idCompte} className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-mono text-sm">{c.nif}</span>
                <span className="font-bold text-red-600">{formatMontant(c.resteARecouvrer)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
