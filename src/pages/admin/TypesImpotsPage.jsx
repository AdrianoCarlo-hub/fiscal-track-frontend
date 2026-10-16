import { useEffect, useState } from 'react';
import typeImpotService from '../../services/typeImpotService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

export default function TypesImpotsPage() {
  const [types, setTypes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const liste = useListView(types);

  const charger = async () => {
    setChargement(true);
    try {
      setTypes(await typeImpotService.lister());
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Types d impots</h1>
      <p className="text-slate-500 text-sm mb-6">{types.length} type(s) enregistre(s)</p>

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{erreur}</div>}

      {!chargement && !erreur && (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher un code, un impôt ou une périodicité…" count={liste.filteredCount} /></div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[620px]">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Periodicite</th>
                <th className="text-left px-4 py-3">Echeance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liste.items.map((t) => (
                <tr key={t.codeImpot} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{t.codeImpot}</td>
                  <td className="px-4 py-3">{t.nomImpot}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 text-xs px-2 py-1 rounded">{t.periodicite}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {t.echeanceTheoriqueMois > 0
                      ? `${t.echeanceTheoriqueJour}/${t.echeanceTheoriqueMois}`
                      : `Jour ${t.echeanceTheoriqueJour}`}
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
