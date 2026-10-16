import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

export default function JoursFeriesPage() {
  const [jours, setJours] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [form, setForm] = useState({ dateFerie: '', description: '' });
  const [erreur, setErreur] = useState('');
  const liste = useListView(jours);

  const charger = async () => {
    setChargement(true);
    try {
      setJours(await adminService.listerJoursFeries());
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const ajouter = async (e) => {
    e.preventDefault();
    try {
      await adminService.ajouterJourFerie(form);
      setForm({ dateFerie: '', description: '' });
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer ce jour ferie ?')) return;
    try {
      await adminService.supprimerJourFerie(id);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Jours feries</h1>

      <form onSubmit={ajouter} className="fiscal-card mb-6 flex flex-col items-stretch gap-3 p-4 sm:flex-row sm:items-end">
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input type="date" required value={form.dateFerie}
            onChange={(e) => setForm({ ...form, dateFerie: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg" />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Description</label>
          <input type="text" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
        </div>
        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg">
          Ajouter
        </button>
      </form>

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{erreur}</div>}

      {!chargement && !erreur && (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher une date ou une description…" count={liste.filteredCount} /></div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[520px]">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liste.items.map((j) => (
                <tr key={j.idJourFerie} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{j.dateFerie}</td>
                  <td className="px-4 py-3">{j.description}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => supprimer(j.idJourFerie)}
                      className="text-red-600 hover:text-red-700 text-sm">Supprimer</button>
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
