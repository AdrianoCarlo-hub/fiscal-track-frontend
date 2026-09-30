import { useState } from 'react';
import paiementService from '../../services/paiementService';

const MODES_PAIEMENT = [
  { value: 'ESPECES', label: 'Especes' },
  { value: 'VIREMENT', label: 'Virement' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'CHEQUE', label: 'Cheque' },
];

export default function PaiementForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    idCompte: '',
    montantVerse: '',
    modePaiement: 'ESPECES',
    referenceTransaction: '',
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
      await paiementService.enregistrer({
        idCompte: Number(form.idCompte),
        montantVerse: Number(form.montantVerse),
        modePaiement: form.modePaiement,
        referenceTransaction: form.referenceTransaction || null,
      });
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Nouveau paiement</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Identifiant du compte courant fiscal *
            </label>
            <input
              type="number"
              name="idCompte"
              value={form.idCompte}
              onChange={handleChange}
              placeholder="Ex : 2"
              required
              min="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Le compte courant est cree automatiquement apres chaque declaration.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Montant verse (Ar) *
            </label>
            <input
              type="number"
              name="montantVerse"
              value={form.montantVerse}
              onChange={handleChange}
              placeholder="Ex : 500000"
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mode de paiement *
            </label>
            <select
              name="modePaiement"
              value={form.modePaiement}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            >
              {MODES_PAIEMENT.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reference de transaction
            </label>
            <input
              type="text"
              name="referenceTransaction"
              value={form.referenceTransaction}
              onChange={handleChange}
              placeholder="Ex : VIR-2026-008"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Optionnel. Doit etre unique si renseigne.
            </p>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erreur}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={chargement}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={chargement}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg disabled:opacity-50"
            >
              {chargement ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
