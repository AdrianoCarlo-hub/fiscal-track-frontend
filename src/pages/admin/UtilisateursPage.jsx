import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const DIVISIONS = ['ACCUEIL', 'GESTION', 'RECETTE', 'CONTROLE', 'DIRECTEUR'];
const ROLES = ['AGENT_GESTION', 'AGENT_RECETTE', 'RESPONSABLE', 'ADMIN'];

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);

  const chargerUtilisateurs = async () => {
    setChargement(true);
    setErreur('');
    try {
      const data = await adminService.listerUtilisateurs();
      setUtilisateurs(data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const supprimer = async (idAgent) => {
    if (!window.confirm(`Supprimer l'agent ${idAgent} ?`)) return;
    try {
      await adminService.supprimerUtilisateur(idAgent);
      chargerUtilisateurs();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de suppression');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-1">{utilisateurs.length} agent(s) enregistre(s)</p>
        </div>
        <button
          onClick={() => setModalOuvert(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
        >
          + Nouvel utilisateur
        </button>
      </div>

      {chargement && <p className="text-slate-500">Chargement...</p>}
      {erreur && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{erreur}</div>}

      {!chargement && !erreur && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Division</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {utilisateurs.map((u) => (
                <tr key={u.idAgent} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{u.idAgent}</td>
                  <td className="px-4 py-3">{u.nomAgent} {u.prenomAgent}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{u.emailAgent}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                      {u.division}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded">
                      {u.roleSecurite}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => supprimer(u.idAgent)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOuvert && (
        <ModalNouvelUtilisateur
          onClose={() => setModalOuvert(false)}
          onSuccess={() => {
            setModalOuvert(false);
            chargerUtilisateurs();
          }}
        />
      )}
    </div>
  );
}

function ModalNouvelUtilisateur({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    idAgent: '',
    nomAgent: '',
    prenomAgent: '',
    emailAgent: '',
    telephoneAgent: '',
    motDePasseHashAgent: '',
    division: 'GESTION',
    roleSecurite: 'AGENT_GESTION',
  });
  const [erreur, setErreur] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      await adminService.ajouterUtilisateur(form);
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de creation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Nouvel utilisateur</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">ID Agent *</label>
              <input name="idAgent" value={form.idAgent} onChange={handleChange}
                maxLength={6} placeholder="AG0005" required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm mb-1">Telephone</label>
              <input name="telephoneAgent" value={form.telephoneAgent} onChange={handleChange}
                placeholder="+261340000005"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Nom *</label>
              <input name="nomAgent" value={form.nomAgent} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm mb-1">Prenom *</label>
              <input name="prenomAgent" value={form.prenomAgent} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Email *</label>
            <input type="email" name="emailAgent" value={form.emailAgent} onChange={handleChange} required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm mb-1">Mot de passe (hash bcrypt) *</label>
            <input name="motDePasseHashAgent" value={form.motDePasseHashAgent} onChange={handleChange} required
              placeholder="$2a$10$..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Division *</label>
              <select name="division" value={form.division} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Role *</label>
              <select name="roleSecurite" value={form.roleSecurite} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {erreur && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{erreur}</div>}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg">
              Creer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
