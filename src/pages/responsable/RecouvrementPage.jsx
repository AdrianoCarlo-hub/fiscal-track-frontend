import { useEffect, useState } from 'react';
import compteCourantService from '../../services/compteCourantService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

export default function RecouvrementPage() {
  const [comptes, setComptes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const liste = useListView(comptes);

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

      {chargement ? <div className="fiscal-card p-8 text-sm text-slate-500">Chargement du recouvrement…</div> : (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher par NIF ou statut…" count={liste.filteredCount} /></div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[700px]">
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
              {liste.items.map((c) => (
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
          </table></div>
        </div>
        {liste.filteredCount === 0 && <p className="mt-3 text-center text-sm text-slate-500">Aucun résultat. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></p>}
        <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />
        </>
      )}
    </div>
  );
}
