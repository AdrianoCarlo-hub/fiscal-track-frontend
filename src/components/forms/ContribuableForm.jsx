import { useState } from 'react';
import contribuableService from '../../services/contribuableService';

const FORMES_JURIDIQUES = ['EI', 'SARL', 'SARLU', 'SA', 'SNC', 'SCS', 'COOPERATIVE', 'ASSOCIATION', 'ONG', 'SUCCURSALE', 'ZEF'];
const REGIMES = ['REEL', 'SYNTHETIQUE'];
const OBLIGATIONS_COMPTABLES = ['COMPLET', 'SMT', 'RECETTES_DEPENSES'];
const STATUTS = ['ACTIF', 'VEILLEUSE', 'RADIE'];

export default function ContribuableForm({ contribuable, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nif: contribuable.nif,
    raisonSociale: contribuable.raisonSociale || '',
    formeJuridique: contribuable.formeJuridique || 'SARL',
    nomDirigeant: contribuable.nomDirigeant || '',
    prenomDirigeant: contribuable.prenomDirigeant || '',
    cinDirigeant: contribuable.cinDirigeant || '',
    emailContribuable: contribuable.emailContribuable || '',
    telephoneContribuable: contribuable.telephoneContribuable || '',
    adresseContribuable: contribuable.adresseContribuable || '',
    communeContribuable: contribuable.communeContribuable || '',
    regimeImposition: contribuable.regimeImposition || 'REEL',
    obligationComptable: contribuable.obligationComptable || 'COMPLET',
    statutActivite: contribuable.statutActivite || 'ACTIF',
    dateImmatriculation: contribuable.dateImmatriculation || '',
    motDePasseHashContribuable: 'placeholder',
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      await contribuableService.modifier(contribuable.nif, form);
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Modifier le contribuable
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Raison sociale *</label>
            <input name="raisonSociale" value={form.raisonSociale} onChange={handleChange} required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Forme juridique</label>
              <select name="formeJuridique" value={form.formeJuridique} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                {FORMES_JURIDIQUES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Regime</label>
              <select name="regimeImposition" value={form.regimeImposition} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                {REGIMES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom dirigeant</label>
              <input name="nomDirigeant" value={form.nomDirigeant} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prenom dirigeant</label>
              <input name="prenomDirigeant" value={form.prenomDirigeant} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CIN dirigeant</label>
              <input name="cinDirigeant" value={form.cinDirigeant} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="emailContribuable" value={form.emailContribuable} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telephone</label>
              <input name="telephoneContribuable" value={form.telephoneContribuable} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Adresse</label>
              <input name="adresseContribuable" value={form.adresseContribuable} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commune</label>
              <input name="communeContribuable" value={form.communeContribuable} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Obligation comptable</label>
              <select name="obligationComptable" value={form.obligationComptable} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                {OBLIGATIONS_COMPTABLES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select name="statutActivite" value={form.statutActivite} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erreur}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={chargement}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={chargement}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg disabled:opacity-50">
              {chargement ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
