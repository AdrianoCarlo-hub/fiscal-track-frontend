import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';
import ConformiteChart from '../../components/charts/ConformiteChart';

export default function DashboardPage() {
  const [indicateurs, setIndicateurs] = useState(null);
  const [top10, setTop10] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const charger = async () => {
      try {
        const [ind, top] = await Promise.all([
          dashboardService.indicateurs(),
          dashboardService.top10Restes(),
        ]);
        setIndicateurs(ind);
        setTop10(top);
      } catch (err) {
        setErreur(err.response?.data?.message || 'Erreur de chargement');
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  if (chargement) return <p>Chargement...</p>;
  if (erreur) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{erreur}</div>;

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPI label="Contribuables" value={indicateurs.nombreContribuables} color="bg-sky-500" />
        <KPI label="Obligations" value={indicateurs.totalObligations} color="bg-indigo-500" />
        <KPI label="En retard" value={indicateurs.obligationsEnRetard} color="bg-red-500" />
        <KPI label="Conformite" value={`${indicateurs.tauxConformite}%`} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MontantCard label="Montant total du" value={formatMontant(indicateurs.montantTotalDu)} />
        <MontantCard label="Montant total paye" value={formatMontant(indicateurs.montantTotalPaye)} />
        <MontantCard label="A recouvrer" value={formatMontant(indicateurs.montantTotalARecouvrer)} highlight />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Repartition des obligations</h2>
          <ConformiteChart data={indicateurs} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Top 10 restes a recouvrer</h2>
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-xs">
              <tr>
                <th className="text-left py-2">NIF</th>
                <th className="text-right py-2">Reste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top10.map((c) => (
                <tr key={c.idCompte}>
                  <td className="py-2 font-mono text-xs">{c.nif}</td>
                  <td className="py-2 text-right font-medium">{formatMontant(c.resteARecouvrer)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className={`w-10 h-1 ${color} rounded mb-3`}></div>
      <p className="text-slate-500 text-xs uppercase">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function MontantCard({ label, value, highlight }) {
  return (
    <div className={`p-5 rounded-xl shadow-sm ${highlight ? 'bg-sky-500 text-white' : 'bg-white'}`}>
      <p className={`text-xs uppercase ${highlight ? 'text-sky-100' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-xl font-bold mt-1 ${highlight ? 'text-white' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}
