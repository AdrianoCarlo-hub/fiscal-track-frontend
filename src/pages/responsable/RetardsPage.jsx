import { useEffect, useState } from 'react';
import obligationService from '../../services/obligationService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

export default function RetardsPage() {
  const [obligations, setObligations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const liste = useListView(obligations);

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

      {chargement ? <div className="fiscal-card p-8 text-sm text-slate-500">Chargement des retards…</div> : (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher par NIF, impôt ou période…" count={liste.filteredCount} /></div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[680px]">
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
              {liste.items.map((o) => (
                <tr key={o.idObligationFiscale}>
                  <td className="px-4 py-3 font-mono text-sm">{o.nif}</td>
                  <td className="px-4 py-3">{o.codeImpot}</td>
                  <td className="px-4 py-3">{o.periodeFiscale}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-danger">{o.dateLimiteReelle}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md border border-danger bg-danger px-2.5 py-1 text-xs font-bold text-white">RETARD</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
        {liste.filteredCount === 0 && <p className="mt-3 text-center text-sm text-slate-500">Aucun résultat. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></p>}
        <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />
        </>
      )}
    </div>
  );
}
