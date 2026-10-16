import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

export default function RapportsPage() {
  const [top10, setTop10] = useState([]);
  const [chargement, setChargement] = useState(true);
  const liste = useListView(top10);

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
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher par NIF ou montant…" count={liste.filteredCount} /></div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-primary mb-1">Plus importants restes à recouvrer</h2>
          <p className="mb-4 text-sm text-slate-500">Montants exprimés en Ariary · résultats fournis par le rapport</p>
          <ul className="space-y-2">
            {liste.items.map((c) => (
              <li key={c.idCompte} className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-mono text-sm">{c.nif}</span>
                <span className="font-bold text-red-600">{formatMontant(c.resteARecouvrer)}</span>
              </li>
            ))}
          </ul>
        </div>
        {liste.filteredCount === 0 && <p className="mt-3 text-center text-sm text-slate-500">Aucun résultat. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></p>}
        <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />
        </>
      )}
    </div>
  );
}
