import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

export default function JoursFeriesPage() {
  const [jours, setJours] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [form, setForm] = useState({ dateFerie: '', description: '' });
  const [erreur, setErreur] = useState('');

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

      <form onSubmit={ajouter} className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-3 items-end">
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jours.map((j) => (
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
          </table>
        </div>
      )}
    </div>
  );
}
