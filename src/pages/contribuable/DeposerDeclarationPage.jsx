import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import declarationService from '../../services/declarationService';

export default function DeposerDeclarationPage() {
  const { idObligation } = useParams();
  const navigate = useNavigate();
  const [chiffreAffaires, setChiffreAffaires] = useState('');
  const [preview, setPreview] = useState(null);
  const [chargementPreview, setChargementPreview] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const timerRef = useRef(null);

  const lancerPreview = (valeur) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (valeur === '' || Number(valeur) < 0) {
      setPreview(null);
      setChargementPreview(false);
      return;
    }
    setChargementPreview(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await declarationService.previsualiser({
          idObligationFiscale: Number(idObligation),
          chiffreAffairesDeclare: Number(valeur),
          impotPrincipalCalcule: 0,
        });
        setPreview(data);
      } catch {
        setPreview(null);
      } finally {
        setChargementPreview(false);
      }
    }, 400);
  };

  const handleChiffreAffaires = (e) => {
    const valeur = e.target.value;
    setChiffreAffaires(valeur);
    lancerPreview(valeur);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await declarationService.deposer({
        idObligationFiscale: Number(idObligation),
        chiffreAffairesDeclare: Number(chiffreAffaires),
        impotPrincipalCalcule: preview?.impotRetenu ?? 0,
      });
      navigate('/contribuable/declarations');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du depot');
    } finally {
      setChargement(false);
    }
  };

  const impotRetenu = preview?.disponible ? preview.impotRetenu : null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Deposer une declaration</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-5">
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg text-sm text-sky-800">
          Obligation fiscale #{idObligation}
          {preview?.codeImpot && <span className="ml-1">({preview.codeImpot})</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Chiffre d'affaires declare (Ar)</label>
          <input type="number" min="0" step="0.01" required value={chiffreAffaires}
            onChange={handleChiffreAffaires}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Impot principal calcule (Ar)</label>
          <input type="number" readOnly value={impotRetenu ?? ''}
            placeholder={chargementPreview ? 'Calcul par le serveur...' : "Saisir le chiffre d'affaires"}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed outline-none" />
          <p className="text-xs text-slate-500 mt-1">
            Ce montant est calcule par le serveur a partir des regles fiscales ; il n'est pas modifiable.
          </p>
        </div>

        {preview?.avertissements?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800 space-y-1">
            {preview.avertissements.map((a, i) => <div key={i}>Attention : {a}</div>)}
          </div>
        )}

        {preview?.etapesCalcul?.length > 0 && (
          <details className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700">
            <summary className="cursor-pointer font-medium">Detail du calcul</summary>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {preview.etapesCalcul.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </details>
        )}

        {erreur && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{erreur}</div>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            Annuler
          </button>
          <button type="submit" disabled={chargement || impotRetenu === null}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg disabled:opacity-50">
            {chargement ? 'Envoi...' : 'Deposer'}
          </button>
        </div>
      </form>
    </div>
  );
}
