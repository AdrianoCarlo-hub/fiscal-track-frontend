import { useEffect, useState } from 'react';
import typeImpotService from '../../services/typeImpotService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/ui/Modal';

const PERIODICITES = ['MENSUELLE', 'ANNUELLE'];

export default function TypesImpotsPage() {
  const [types, setTypes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [modalCreation, setModalCreation] = useState(false);
  const [typeEnEdition, setTypeEnEdition] = useState(null);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Types d impots</h1>
          <p className="text-slate-500 text-sm mt-1">{types.length} type(s) enregistre(s)</p>
        </div>
        <button
          onClick={() => setModalCreation(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
        >
          + Nouveau type
        </button>
      </div>

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{erreur}</div>}

      {!chargement && !erreur && (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher un code, un impot ou une periodicite..." count={liste.filteredCount} /></div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[620px]">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Periodicite</th>
                <th className="text-left px-4 py-3">Echeance</th>
                <th className="text-right px-4 py-3">Actions</th>
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
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setTypeEnEdition(t)}
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

      {modalCreation && (
        <ModalCreationType onClose={() => setModalCreation(false)} onSuccess={() => { setModalCreation(false); charger(); }} />
      )}
      {typeEnEdition && (
        <ModalEditionType type={typeEnEdition} onClose={() => setTypeEnEdition(null)} onSuccess={() => { setTypeEnEdition(null); charger(); }} />
      )}
    </div>
  );
}

function ModalCreationType({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    codeImpot: '', nomImpot: '', periodicite: 'MENSUELLE',
    echeanceTheoriqueJour: 1, echeanceTheoriqueMois: 1,
  });
  const [erreur, setErreur] = useState('');
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      await typeImpotService.creer({
        ...form,
        echeanceTheoriqueJour: parseInt(form.echeanceTheoriqueJour, 10),
        echeanceTheoriqueMois: parseInt(form.echeanceTheoriqueMois, 10) || null,
      });
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de creation');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Nouveau type d'impot"
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
          <button type="submit" form="form-creation-type" className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg">Creer</button>
        </div>
      }>
      <form id="form-creation-type" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Code *</label>
            <input name="codeImpot" value={form.codeImpot} onChange={handleChange} required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm mb-1">Nom *</label>
            <input name="nomImpot" value={form.nomImpot} onChange={handleChange} required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Periodicite</label>
            <select name="periodicite" value={form.periodicite} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              {PERIODICITES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Jour</label>
            <input name="echeanceTheoriqueJour" value={form.echeanceTheoriqueJour} onChange={handleChange} type="number" min="1" max="31"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm mb-1">Mois (0 = n/a)</label>
            <input name="echeanceTheoriqueMois" value={form.echeanceTheoriqueMois} onChange={handleChange} type="number" min="0" max="12"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
        {erreur && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{erreur}</div>}
      </form>
    </Modal>
  );
}

function ModalEditionType({ type, onClose, onSuccess }) {
  const [form, setForm] = useState({
    codeImpot: type.codeImpot, nomImpot: type.nomImpot || '', periodicite: type.periodicite || 'MENSUELLE',
    echeanceTheoriqueJour: type.echeanceTheoriqueJour ?? 1, echeanceTheoriqueMois: type.echeanceTheoriqueMois ?? 1,
  });
  const [erreur, setErreur] = useState('');
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      await typeImpotService.modifier(type.codeImpot, {
        ...form,
        echeanceTheoriqueJour: parseInt(form.echeanceTheoriqueJour, 10),
        echeanceTheoriqueMois: parseInt(form.echeanceTheoriqueMois, 10) || null,
      });
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de modification');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Modifier ${type.codeImpot}`}
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
          <button type="submit" form="form-edition-type" className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg">Enregistrer</button>
        </div>
      }>
      <form id="form-edition-type" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nom *</label>
          <input name="nomImpot" value={form.nomImpot} onChange={handleChange} required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Periodicite</label>
            <select name="periodicite" value={form.periodicite} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              {PERIODICITES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Jour</label>
            <input name="echeanceTheoriqueJour" value={form.echeanceTheoriqueJour} onChange={handleChange} type="number" min="1" max="31"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm mb-1">Mois (0 = n/a)</label>
            <input name="echeanceTheoriqueMois" value={form.echeanceTheoriqueMois} onChange={handleChange} type="number" min="0" max="12"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
        {erreur && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{erreur}</div>}
      </form>
    </Modal>
  );
}
