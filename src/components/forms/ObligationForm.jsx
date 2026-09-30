import { useState } from 'react';
import obligationService from '../../services/obligationService';

export default function ObligationForm({ nif, onClose, onSuccess }) {
  const [form, setForm] = useState({
    codeImpot: 'TVA',
    periodeFiscale: '',
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
      await obligationService.generer(nif, form.codeImpot, form.periodeFiscale);
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la generation');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Generer une obligation</h2>
        <p className="text-sm text-slate-500 mb-4">
          Contribuable : <span className="font-mono">{nif}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Type d'impot *
            </label>
            <select
              name="codeImpot"
              value={form.codeImpot}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="TVA">TVA - Taxe sur la Valeur Ajoutee (Mensuelle)</option>
              <option value="IRSA">IRSA - Impot sur les Revenus Salariaux (Mensuelle)</option>
              <option value="IS">IS - Impot Synthetique (Annuelle)</option>
              <option value="IR">IR - Impot sur les Revenus (Annuelle)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Periode fiscale *
            </label>
            <input
              type="text"
              name="periodeFiscale"
              value={form.periodeFiscale}
              onChange={handleChange}
              placeholder="Ex : 2026-10 (mensuel) ou 2025 (annuel)"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Format : YYYY-MM pour les impots mensuels, YYYY pour les impots annuels.
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
              {chargement ? 'Generation...' : 'Generer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
