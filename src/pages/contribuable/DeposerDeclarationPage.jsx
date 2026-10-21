import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calculator, Info } from 'lucide-react';
import declarationService from '../../services/declarationService';
import obligationService from '../../services/obligationService';
import contribuableService from '../../services/contribuableService';
import FormulaireDeclaration from '../../components/forms/FormulaireDeclaration';
import { libelleImpot } from '../../utils/fiscalConstants';
import { formatMontant, formatDate } from '../../utils/formatUtils';
import {
  valeursInitiales,
  construireCorps,
  pretPourPrevisualisation,
} from '../../utils/declarationUtils';

const AIDE_AGENT = 'Si ces informations sont inexactes, contactez votre agent du centre fiscal.';

export default function DeposerDeclarationPage() {
  const { idObligation } = useParams();
  const navigate = useNavigate();

  const [obligation, setObligation] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [valeurs, setValeurs] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState('');

  const [preview, setPreview] = useState(null);
  const [chargementPreview, setChargementPreview] = useState(false);
  const [erreurPreview, setErreurPreview] = useState('');

  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let actif = true;
    const charger = async () => {
      try {
        const o = await obligationService.parId(idObligation);
        const d = await contribuableService.parNif(o.nif).catch(() => null);
        if (!actif) return;
        const initiales = valeursInitiales(o.codeImpot);
        if (d?.categorieActivite) {
          if (o.codeImpot === 'IS') initiales.categorieActiviteIs = d.categorieActivite;
          if (o.codeImpot === 'IR') initiales.categorieActivite = d.categorieActivite;
        }
        setObligation(o);
        setDossier(d);
        setValeurs(initiales);
        setChargement(false);
      } catch (err) {
        if (!actif) return;
        setErreurChargement(err.response?.data?.message
          || 'Impossible de charger cette obligation fiscale.');
        setChargement(false);
      }
    };
    charger();
    return () => { actif = false; };
  }, [idObligation]);

  useEffect(() => {
    if (!obligation || !valeurs || !pretPourPrevisualisation(obligation.codeImpot, valeurs)) {
      return undefined;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setChargementPreview(true);
      // On memorise la saisie exacte qui a produit le resultat : un montant
      // calcule sur d'anciennes valeurs ne doit ni s'afficher ni etre envoye.
      const corps = construireCorps(obligation.codeImpot, idObligation, valeurs, 0);
      try {
        const data = await declarationService.previsualiser(corps);
        setPreview({ data, corps: JSON.stringify(corps) });
        setErreurPreview('');
      } catch (err) {
        setPreview(null);
        setErreurPreview(err.response?.data?.message || 'Le serveur n’a pas pu calculer cet impôt.');
      } finally {
        setChargementPreview(false);
      }
    }, 450);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [obligation, valeurs, idObligation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preview?.data?.disponible || !pretPourPrevisualisation(obligation.codeImpot, valeurs)) return;
    const corpsCourant = JSON.stringify(construireCorps(obligation.codeImpot, idObligation, valeurs, 0));
    if (preview.corps !== corpsCourant) return;
    setErreur('');
    setEnvoi(true);
    try {
      await declarationService.deposer(construireCorps(
        obligation.codeImpot, idObligation, valeurs, preview.data.impotRetenu,
      ));
      navigate('/contribuable/declarations');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du dépôt de la déclaration');
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) {
    return <div className="fiscal-card p-8 text-sm text-slate-500">Chargement de l’obligation…</div>;
  }

  if (erreurChargement) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          {erreurChargement}
        </div>
        <button onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
      </div>
    );
  }

  if (obligation.statutDeclaration === 'DEPOSE') {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Déclaration déjà déposée</h1>
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg text-sm text-sky-800">
          Une déclaration a déjà été déposée pour cette obligation
          ({libelleImpot(obligation.codeImpot)}, période {obligation.periodeFiscale}).
        </div>
        <button onClick={() => navigate('/contribuable/declarations')}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voir mes déclarations
        </button>
      </div>
    );
  }

  const codeImpot = obligation.codeImpot;
  const pret = pretPourPrevisualisation(codeImpot, valeurs);
  const corpsActuel = JSON.stringify(construireCorps(codeImpot, idObligation, valeurs, 0));
  // Le resultat ne s'affiche que si la saisie correspond toujours au calcul.
  const previewAffiche = pret && preview?.corps === corpsActuel ? preview.data : null;
  const impotRetenu = previewAffiche?.disponible ? previewAffiche.impotRetenu : null;
  const creditFiscal = previewAffiche?.disponible ? Number(previewAffiche.creditFiscal || 0) : 0;
  const aCredit = creditFiscal > 0;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <h1 className="mt-2 text-2xl font-bold text-slate-800">Déposer une déclaration</h1>
        <p className="mt-1 text-sm text-slate-500">
          {libelleImpot(codeImpot)} — période {obligation.periodeFiscale}
          {obligation.dateLimiteReelle && <> — dépôt avant le {formatDate(obligation.dateLimiteReelle)}</>}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="fiscal-card p-6 space-y-6">
        {dossier && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-700">Dossier rattaché à cette déclaration</p>
            <p className="mt-1 text-slate-600">
              NIF {dossier.nif} — {dossier.raisonSociale}
              {dossier.categorieActivite && <> · Catégorie : {dossier.categorieActivite}</>}
            </p>
            <p className="mt-2 text-xs text-slate-500">{AIDE_AGENT}</p>
          </div>
        )}

        <FormulaireDeclaration codeImpot={codeImpot} valeurs={valeurs} onChange={setValeurs} />

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calculator className="h-4 w-4 text-primary" /> Impôt calculé par le serveur
          </div>

          <div className={aCredit ? 'grid gap-4 sm:grid-cols-2' : ''}>
            <div>
              <label htmlFor="impot-calcule" className="block text-sm font-medium text-slate-700 mb-1">
                Impôt principal (Ar)
              </label>
              <input id="impot-calcule" type="text" readOnly
                value={impotRetenu !== null ? formatMontant(impotRetenu) : ''}
                placeholder={chargementPreview ? 'Calcul en cours…' : 'Renseignez les champs ci-dessus'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed outline-none text-sm" />
              <p className="mt-1 text-xs text-slate-500">
                Ce montant est calculé par le serveur à partir des règles fiscales en vigueur :
                il n’est pas modifiable.
              </p>
            </div>

            {aCredit && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  {codeImpot === 'TVA' ? 'Crédit de TVA à reporter' : 'Crédit fiscal'} (Ar)
                </p>
                <p className="mt-1 text-xl font-bold text-emerald-800">
                  {formatMontant(creditFiscal)}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Votre {codeImpot === 'TVA' ? 'TVA nette est négative' : 'crédit est positif'} :
                  vous n’avez rien à payer. Ce crédit est reporté sur votre prochaine déclaration.
                </p>
              </div>
            )}
          </div>

          {previewAffiche?.explication && (
            <p className="text-xs text-slate-600 flex gap-2">
              <Info className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{previewAffiche.explication}</span>
            </p>
          )}

          {!chargementPreview && !pret && (
            <p className="text-xs text-slate-500">
              Renseignez les champs obligatoires (marqués d’un <span className="text-danger">*</span>)
              pour obtenir le montant de l’impôt.
            </p>
          )}

          {previewAffiche?.disponible === false && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {previewAffiche.explication || 'Aucun montant ne peut être calculé pour cette déclaration.'}
            </div>
          )}

          {previewAffiche?.avertissements?.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 space-y-1">
              {previewAffiche.avertissements.map((a, i) => <p key={i}>{a}</p>)}
            </div>
          )}

          {previewAffiche?.etapesCalcul?.length > 0 && (
            <details className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <summary className="cursor-pointer font-medium">Détail du calcul</summary>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {previewAffiche.etapesCalcul.map((etape, i) => <li key={i}>{etape}</li>)}
              </ul>
            </details>
          )}

          {pret && erreurPreview && (
            <p className="text-sm text-red-600">{erreurPreview}</p>
          )}
        </div>

        {erreur && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{erreur}</div>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm">
            Annuler
          </button>
          <button type="submit"
            disabled={!pret || chargementPreview || impotRetenu === null || envoi}
            className="px-6 py-2 bg-primary hover:bg-deep text-white rounded-lg text-sm disabled:opacity-50">
            {envoi ? 'Envoi…' : 'Déposer la déclaration'}
          </button>
        </div>
      </form>
    </div>
  );
}
