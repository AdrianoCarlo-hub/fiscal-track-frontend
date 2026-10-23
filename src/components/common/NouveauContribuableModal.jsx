import { useState } from 'react';
import contribuableService from '../../services/contribuableService';
import Modal from '../ui/Modal';

const FORMES_JURIDIQUES = ['EI', 'SARL', 'SARLU', 'SA', 'SNC', 'SCS', 'COOPERATIVE', 'ASSOCIATION', 'ONG', 'SUCCURSALE', 'ZEF'];
const REGIMES = ['REEL', 'SYNTHETIQUE'];
const OBLIGATIONS_COMPTABLES = ['COMPLET', 'SMT', 'RECETTES_DEPENSES'];
const STATUTS = ['ACTIF', 'VEILLEUSE', 'RADIE'];
const NIF_REGEX = /^\d{10}$/;

const CHAMPS_INITIAUX = {
  nif: '',
  raisonSociale: '',
  formeJuridique: 'SARL',
  nomDirigeant: '',
  prenomDirigeant: '',
  cinDirigeant: '',
  emailContribuable: '',
  telephoneContribuable: '',
  adresseContribuable: '',
  communeContribuable: '',
  regimeImposition: 'REEL',
  obligationComptable: 'COMPLET',
  statutActivite: 'ACTIF',
  dateImmatriculation: '',
  motDePasseHashContribuable: '',
};

export default function NouveauContribuableModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(CHAMPS_INITIAUX);
  const [erreur, setErreur] = useState('');
  const [nifTouche, setNifTouche] = useState(false);
  const [chargement, setChargement] = useState(false);

  const nifValide = NIF_REGEX.test(form.nif);
  const nifInvalide = (nifTouche || form.nif.length > 0) && !nifValide;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const valeur = name === 'nif' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setForm((actuel) => ({ ...actuel, [name]: valeur }));
  };

  const reinitialiser = () => {
    setForm(CHAMPS_INITIAUX);
    setErreur('');
    setNifTouche(false);
  };

  const fermer = () => {
    reinitialiser();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    if (!nifValide) {
      setNifTouche(true);
      return;
    }
    setChargement(true);
    try {
      await contribuableService.creer(form);
      reinitialiser();
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la creation');
    } finally {
      setChargement(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={fermer} title="Nouveau contribuable">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">NIF * (10 chiffres)</label>
            <input
              id="nif"
              name="nif"
              value={form.nif}
              onChange={handleChange}
              onBlur={() => setNifTouche(true)}
              required
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]{10}"
              autoComplete="off"
              aria-invalid={nifInvalide}
              aria-describedby={nifInvalide ? 'nif-erreur' : undefined}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none ${nifInvalide ? 'border-red-400' : 'border-slate-300'}`}
            />
            {nifInvalide && (
              <p id="nif-erreur" className="mt-1 text-sm text-red-600">
                Le NIF doit contenir exactement 10 chiffres
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date d'immatriculation *</label>
            <input type="date" name="dateImmatriculation" value={form.dateImmatriculation} onChange={handleChange} required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Raison sociale *</label>
          <input name="raisonSociale" value={form.raisonSociale} onChange={handleChange} required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe * (accès espace contribuable)</label>
          <input type="password" name="motDePasseHashContribuable" value={form.motDePasseHashContribuable} onChange={handleChange} required
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{erreur}</div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={fermer} disabled={chargement}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
            Annuler
          </button>
          <button type="submit" disabled={chargement}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg disabled:opacity-50">
            {chargement ? 'Creation...' : 'Creer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
