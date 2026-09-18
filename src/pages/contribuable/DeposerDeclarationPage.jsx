import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import declarationService from '../../services/declarationService';

export default function DeposerDeclarationPage() {
  const { idObligation } = useParams();
  const navigate = useNavigate();
  const [chiffreAffaires, setChiffreAffaires] = useState('');
  const [impotCalcule, setImpotCalcule] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await declarationService.deposer({
        idObligationFiscale: Number(idObligation),
        chiffreAffairesDeclare: Number(chiffreAffaires),
        impotPrincipalCalcule: Number(impotCalcule),
      });
      navigate('/contribuable/declarations');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du depot');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Deposer une declaration</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-5">
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg text-sm text-sky-800">
          Obligation fiscale #{idObligation}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Chiffre d'affaires declare (Ar)</label>
          <input type="number" min="0" step="0.01" required value={chiffreAffaires}
            onChange={(e) => setChiffreAffaires(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Impot principal calcule (Ar)</label>
          <input type="number" min="0" step="0.01" required value={impotCalcule}
            onChange={(e) => setImpotCalcule(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
        </div>

        {erreur && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{erreur}</div>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            Annuler
          </button>
          <button type="submit" disabled={chargement}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg disabled:opacity-50">
            {chargement ? 'Envoi...' : 'Deposer'}
          </button>
        </div>
      </form>
    </div>
  );
}
