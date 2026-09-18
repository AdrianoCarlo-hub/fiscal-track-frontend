import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';

export default function IndicateursPage() {
  const [ind, setInd] = useState(null);

  useEffect(() => {
    dashboardService.indicateurs().then(setInd).catch(() => {});
  }, []);

  if (!ind) return <p>Chargement...</p>;

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Indicateurs detailles</h1>
      <div className="grid grid-cols-2 gap-4">
        <Info label="Nombre de contribuables" value={ind.nombreContribuables} />
        <Info label="Total obligations" value={ind.totalObligations} />
        <Info label="Obligations deposees" value={ind.obligationsDeposees} />
        <Info label="Obligations en attente" value={ind.obligationsEnAttente} />
        <Info label="Obligations en retard" value={ind.obligationsEnRetard} />
        <Info label="Taux de conformite" value={`${ind.tauxConformite}%`} />
        <Info label="Montant total du" value={formatMontant(ind.montantTotalDu)} />
        <Info label="Montant total paye" value={formatMontant(ind.montantTotalPaye)} />
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <p className="text-slate-500 text-xs uppercase">{label}</p>
      <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}
