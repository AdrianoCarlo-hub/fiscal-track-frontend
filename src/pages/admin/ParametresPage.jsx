import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

export default function ParametresPage() {
  const [parametres, setParametres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [enEdition, setEnEdition] = useState(null);
  const liste = useListView(parametres);

  const charger = async () => {
    setChargement(true);
    setErreur('');
    try {
      setParametres(await adminService.listerParametres());
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(charger);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Parametres fiscaux</h1>
      <p className="text-slate-500 text-sm mb-6">{parametres.length} parametre(s) enregistre(s)</p>

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{erreur}</div>}

      {!chargement && !erreur && (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher un code, une base legale ou un secteur..." count={liste.filteredCount} /></div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px]">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-right px-4 py-3">Valeur</th>
                <th className="text-left px-4 py-3">Annees</th>
                <th className="text-left px-4 py-3">Base legale</th>
                <th className="text-left px-4 py-3">Secteur</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liste.items.map((p) => (
                <tr key={p.code} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{p.code}</td>
                  <td className="px-4 py-3 text-right font-semibold">{p.valeur}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.anneeDebut} - {p.anneeFin ?? '...'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.baseLegale}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.secteur}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEnEdition(p)}
                      className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
        {liste.items.length === 0 && <p className="mt-3 text-center text-sm text-slate-500">Aucun resultat. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></p>}
        <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />
        </>
      )}

      {enEdition && (
        <ModalEditionParametre
          parametre={enEdition}
          onClose={() => setEnEdition(null)}
          onSuccess={() => { setEnEdition(null); charger(); }}
        />
      )}
    </div>
  );
}

function ModalEditionParametre({ parametre, onClose, onSuccess }) {
  const [form, setForm] = useState({
    valeur: parametre.valeur ?? '',
    anneeDebut: parametre.anneeDebut ?? '',
    anneeFin: parametre.anneeFin ?? '',
    baseLegale: parametre.baseLegale ?? '',
    secteur: parametre.secteur ?? '',
    description: parametre.description ?? '',
  });
  const [erreur, setErreur] = useState('');
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    const payload = {
      valeur: parseFloat(form.valeur),
      anneeDebut: form.anneeDebut === '' ? null : parseInt(form.anneeDebut, 10),
      anneeFin: form.anneeFin === '' ? null : parseInt(form.anneeFin, 10),
      baseLegale: form.baseLegale || null,
      secteur: form.secteur || null,
      description: form.description || null,
    };
    try {
      await adminService.modifierParametre(parametre.code, payload);
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de modification');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Modifier {parametre.code}</h2>
        <p className="text-sm text-slate-500 mb-4">{parametre.description}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Valeur *</label>
              <input name="valeur" value={form.valeur} onChange={handleChange} required step="any"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm mb-1">Base legale</label>
              <input name="baseLegale" value={form.baseLegale} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Annee debut</label>
              <input name="anneeDebut" value={form.anneeDebut} onChange={handleChange} placeholder="ex: 2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm mb-1">Annee fin</label>
              <input name="anneeFin" value={form.anneeFin} onChange={handleChange} placeholder="vide = ouvert"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          {erreur && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{erreur}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}
