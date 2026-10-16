import { useEffect, useState } from 'react';
import compteCourantService from '../../services/compteCourantService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

export default function DettesAgentPage() {
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

  const total = comptes.reduce((acc, c) => acc + Number(c.resteARecouvrer || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Suivi des dettes</h1>

      <div className="mb-6 rounded-xl border-l-4 border-danger bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Total à recouvrer</p>
        <p className="fiscal-money mt-2 text-3xl font-semibold text-danger">{formatMontant(total)}</p>
        <p className="mt-1 text-sm text-slate-500">{comptes.length} compte(s) non soldé(s)</p>
      </div>

      {chargement ? <div className="fiscal-card p-8 text-sm text-slate-500">Chargement des dettes…</div> : (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher par compte, NIF ou statut…" count={liste.filteredCount} /></div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[680px]">
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
              {liste.items.map((c) => (
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
          </table></div>
        </div>
        {liste.items.length === 0 && <p className="mt-3 text-center text-sm text-slate-500">Aucun résultat. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></p>}
        <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />
        </>
      )}
    </div>
  );
}
