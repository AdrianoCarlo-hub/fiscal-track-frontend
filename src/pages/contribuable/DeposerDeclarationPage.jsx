import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calculator, Info } from 'lucide-react';
import declarationService from '../../services/declarationService';
import obligationService from '../../services/obligationService';
import contribuableService from '../../services/contribuableService';
import acomptesService from '../../services/acomptesService';
import { ApiError, messageErreur } from '../../services/api';
import FormulaireDeclaration from '../../components/forms/FormulaireDeclaration';
import AcomptesDejaVerses from '../../components/acomptes/AcomptesDejaVerses';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import DetailList from '../../components/ui/DetailList';
import { libelleImpot, libelleCategorie } from '../../utils/fiscalConstants';
import { formatMontant, formatDate, formatTaux } from '../../utils/formatUtils';
import {
  valeursInitiales,
  construireCorps,
  pretPourPrevisualisation,
  impotAvantAcomptes,
  acomptesVerses,
} from '../../utils/declarationUtils';

const AIDE_AGENT = 'Si ces informations sont inexactes, contactez votre agent du centre fiscal.';

function versErreur(err, repli) {
  if (err instanceof ApiError) return err;
  return new ApiError(messageErreur(err) || repli);
}

export default function DeposerDeclarationPage() {
  const { idObligation } = useParams();
  const navigate = useNavigate();

  const [obligation, setObligation] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [valeurs, setValeurs] = useState(null);
  const [acomptesExercice, setAcomptesExercice] = useState([]);
  const [chargementAcomptes, setChargementAcomptes] = useState(false);
  const [erreurAcomptes, setErreurAcomptes] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState(null);

  const [preview, setPreview] = useState(null);
  const [chargementPreview, setChargementPreview] = useState(false);
  const [erreurPreview, setErreurPreview] = useState(null);

  const [erreurEnvoi, setErreurEnvoi] = useState(null);
  const [champsEnvoi, setChampsEnvoi] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let actif = true;
    const charger = async () => {
      try {
        const obligationChargee = await obligationService.parId(idObligation);
        const dossierCharge = await contribuableService
          .parNif(obligationChargee.nif)
          .catch(() => null);
        if (!actif) return;
        const initiales = valeursInitiales(obligationChargee.codeImpot);
        if (dossierCharge?.categorieActivite) {
          if (obligationChargee.codeImpot === 'IS') {
            initiales.categorieActiviteIs = dossierCharge.categorieActivite;
          }
          if (obligationChargee.codeImpot === 'IR') {
            initiales.categorieActivite = dossierCharge.categorieActivite;
          }
        }
        setObligation(obligationChargee);
        setDossier(dossierCharge);
        setValeurs(initiales);
        setChargement(false);
      } catch (err) {
        if (!actif) return;
        setErreurChargement(versErreur(err, 'Impossible de charger cette obligation fiscale.'));
        setChargement(false);
      }
    };
    charger();
    return () => {
      actif = false;
    };
  }, [idObligation]);

  useEffect(() => {
    if (!obligation || !['IR', 'IS'].includes(obligation.codeImpot)) return undefined;
    const exercice =
      Number(String(obligation.periodeFiscale || '').slice(0, 4)) || new Date().getFullYear();
    let actif = true;
    Promise.resolve()
      .then(() => {
        if (!actif) return null;
        setChargementAcomptes(true);
        setErreurAcomptes(null);
        return acomptesService.lister(obligation.nif, exercice);
      })
      .then((donnees) => {
        if (actif && donnees) setAcomptesExercice(Array.isArray(donnees) ? donnees : []);
      })
      .catch((err) => {
        if (actif) setErreurAcomptes(versErreur(err, 'Impossible de charger les acomptes.'));
      })
      .finally(() => {
        if (actif) setChargementAcomptes(false);
      });
    return () => {
      actif = false;
    };
  }, [obligation]);

  useEffect(() => {
    if (!obligation || !valeurs || !pretPourPrevisualisation(obligation.codeImpot, valeurs)) {
      return undefined;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setChargementPreview(true);
      const corps = construireCorps(obligation.codeImpot, idObligation, valeurs, 0);
      try {
        const data = await declarationService.previsualiser(corps);
        setPreview({ data, corps: JSON.stringify(corps) });
        setErreurPreview(null);
      } catch (err) {
        setPreview(null);
        setErreurPreview(versErreur(err, 'Le serveur n’a pas pu calculer cet impôt.'));
      } finally {
        setChargementPreview(false);
      }
    }, 450);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [obligation, valeurs, idObligation]);

  const pret = obligation ? pretPourPrevisualisation(obligation.codeImpot, valeurs || {}) : false;
  const corpsActuel = obligation
    ? JSON.stringify(construireCorps(obligation.codeImpot, idObligation, valeurs || {}, 0))
    : '';
  const previewAffiche = pret && preview?.corps === corpsActuel ? preview.data : null;
  const impotRetenu = previewAffiche?.disponible ? previewAffiche.impotRetenu : null;

  const detailAcomptes = useMemo(() => {
    if (previewAffiche?.detailAcomptes) return previewAffiche.detailAcomptes;
    if (obligation && ['IR', 'IS'].includes(obligation.codeImpot) && acomptesExercice.length > 0) {
      const totalPaye = acomptesExercice.reduce(
        (total, acompte) => total + Number(acompte.montantPaye || 0),
        0,
      );
      return {
        lignes: acomptesExercice.map((acompte) => ({
          periode: acompte.periodeFiscale,
          dateLimiteReelle: acompte.dateLimiteReelle,
          statut: acompte.statutDeclaration,
          montantDu: acompte.montantAcompte,
          montantPaye: acompte.montantPaye,
        })),
        acomptesPayes: totalPaye,
        autresAcomptes: 0,
        creditAnterieur: 0,
        totalDeduit: totalPaye,
      };
    }
    return null;
  }, [previewAffiche, obligation, acomptesExercice]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!previewAffiche?.disponible || !pret) return;
    if (preview.corps !== corpsActuel) return;
    setErreurEnvoi(null);
    setChampsEnvoi({});
    setEnvoi(true);
    try {
      await declarationService.deposer(
        construireCorps(obligation.codeImpot, idObligation, valeurs, previewAffiche.impotRetenu),
      );
      navigate('/contribuable/declarations', { replace: true });
    } catch (err) {
      const apiError = versErreur(err, 'Erreur lors du dépôt de la déclaration.');
      setErreurEnvoi(apiError);
      setChampsEnvoi(apiError.champs || {});
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) {
    return (
      <div>
        <PageHeader titre="Déposer une déclaration" fil={[{ libelle: 'Mes obligations' }]} />
        <LoadingState lignes={4} />
      </div>
    );
  }

  if (erreurChargement) {
    return (
      <div>
        <PageHeader titre="Déposer une déclaration" fil={[{ libelle: 'Mes obligations' }]} />
        <ErrorState erreur={erreurChargement} onReessayer={() => navigate(-1)} />
      </div>
    );
  }

  if (obligation.statutDeclaration === 'DEPOSE') {
    return (
      <div>
        <PageHeader
          titre="Déclaration déjà déposée"
          description={`${libelleImpot(obligation.codeImpot)} — période ${obligation.periodeFiscale}`}
          fil={[{ libelle: 'Mes déclarations' }]}
        />
        <Alert variante="info" titre="Aucune action nécessaire">
          Une déclaration a déjà été enregistrée pour cette obligation. Consultez-la depuis votre
          historique.
        </Alert>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/contribuable/declarations')}>
            Voir mes déclarations
          </Button>
        </div>
      </div>
    );
  }

  const codeImpot = obligation.codeImpot;
  const estAcompte = String(codeImpot).startsWith('ACOMPTE');
  const creditFiscal = previewAffiche?.disponible ? Number(previewAffiche.creditFiscal || 0) : 0;
  const aCredit = creditFiscal > 0;
  const impotCalculeAvant = previewAffiche?.disponible
    ? impotAvantAcomptes(previewAffiche, codeImpot)
    : null;
  const verses = acomptesVerses(detailAcomptes);
  const creditAnterieur = Number(detailAcomptes?.creditAnterieur || 0);
  const detailAcompte = previewAffiche?.detailAcomptes || {};
  const baseAcompte = detailAcompte.base ?? previewAffiche?.baseAcompte;
  const tauxAcompte = detailAcompte.taux ?? previewAffiche?.tauxAcompte;
  const exerciceBaseAcompte = detailAcompte.exerciceBase ?? previewAffiche?.exerciceBase;
  const peutDeposer = pret && !chargementPreview && impotRetenu !== null && !envoi;

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour
        </button>
      </div>

      <PageHeader
        titre={estAcompte ? 'Déposer un acompte' : 'Déposer une déclaration'}
        description={`${libelleImpot(codeImpot)} — période ${obligation.periodeFiscale}${
          obligation.dateLimiteReelle
            ? ` — dépôt avant le ${formatDate(obligation.dateLimiteReelle)}`
            : ''
        }`}
        fil={[{ libelle: 'Mes obligations' }, { libelle: 'Déclaration' }]}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <SectionCard titre="Dossier rattaché">
          {dossier ? (
            <>
              <DetailList
                colonnes={2}
                elements={[
                  { libelle: 'NIF', valeur: dossier.nif },
                  { libelle: 'Raison sociale', valeur: dossier.raisonSociale },
                  {
                    libelle: 'Catégorie d’activité',
                    valeur: dossier.categorieActivite
                      ? libelleCategorie(dossier.categorieActivite)
                      : null,
                  },
                  { libelle: 'Période déclarée', valeur: obligation.periodeFiscale },
                ]}
              />
              <p className="mt-3 text-xs text-slate-500">{AIDE_AGENT}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Les informations du dossier n’ont pas pu être chargées, mais vous pouvez poursuivre la
              déclaration.
            </p>
          )}
        </SectionCard>

        <SectionCard titre="Informations à déclarer">
          <FormulaireDeclaration
            codeImpot={codeImpot}
            valeurs={valeurs}
            onChange={setValeurs}
            erreurs={champsEnvoi}
          />
        </SectionCard>

        {estAcompte && (
          <SectionCard
            titre="Montant de l’acompte"
            description="Calculé par le serveur, non modifiable."
          >
            {chargementPreview && (
              <p className="text-sm text-slate-500">Calcul du montant par le serveur…</p>
            )}
            {!chargementPreview && erreurPreview && (
              <Alert variante="avertissement" titre="Calcul indisponible">
                {erreurPreview.message}
              </Alert>
            )}
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Base de calcul</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {detailAcompte.baseLibelle ||
                    (exerciceBaseAcompte
                      ? `${String(codeImpot).replace('ACOMPTE_', '')} ${exerciceBaseAcompte} = ${formatMontant(baseAcompte)}`
                      : detailAcompte.type === 'DEBUT_ACTIVITE'
                        ? 'Forfait de démarrage'
                        : '—')}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Taux</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {tauxAcompte != null ? formatTaux(tauxAcompte) : 'Forfait'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Montant à payer</p>
                <p className="mt-1 text-lg font-bold text-primary">
                  {impotRetenu !== null
                    ? formatMontant(impotRetenu)
                    : chargementPreview
                      ? 'Calcul en cours…'
                      : '—'}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Le montant est recalculé par le serveur au dépôt : il ne peut pas être modifié.
            </p>
          </SectionCard>
        )}

        {!estAcompte && ['IR', 'IS'].includes(codeImpot) && (
          <>
            {erreurAcomptes && (
              <Alert variante="avertissement" titre="Acomptes indisponibles">
                {erreurAcomptes.message}
              </Alert>
            )}
            <AcomptesDejaVerses detail={detailAcomptes} chargement={chargementAcomptes} />
          </>
        )}

        {!estAcompte && (
          <SectionCard>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calculator className="h-4 w-4 text-primary" aria-hidden="true" />
              Impôt calculé par le serveur
            </div>

            {['IR', 'IS'].includes(codeImpot) ? (
              <div className="space-y-3">
                <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
                    <dt className="text-slate-600">Impôt calculé</dt>
                    <dd className="font-medium text-slate-800">
                      {impotCalculeAvant !== null
                        ? formatMontant(impotCalculeAvant)
                        : chargementPreview
                          ? 'Calcul en cours…'
                          : '—'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
                    <dt className="text-slate-600">
                      Moins acomptes versés (paiements, douane, marchés publics)
                    </dt>
                    <dd className="font-medium text-success">− {formatMontant(verses)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
                    <dt className="text-slate-600">Moins crédit antérieur reporté</dt>
                    <dd className="font-medium text-success">− {formatMontant(creditAnterieur)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 bg-slate-50 px-3 py-3">
                    <dt className="font-semibold text-slate-800">
                      {aCredit ? 'Crédit d’impôt reporté' : 'Solde à payer'}
                    </dt>
                    <dd
                      className={`text-lg font-bold ${aCredit ? 'text-success' : 'text-primary'}`}
                    >
                      {impotRetenu !== null
                        ? formatMontant(aCredit ? creditFiscal : impotRetenu)
                        : chargementPreview
                          ? 'Calcul en cours…'
                          : '—'}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-slate-500">
                  {aCredit
                    ? 'Le crédit d’impôt n’est jamais remboursé : il est reporté sur la prochaine déclaration du même impôt.'
                    : 'Le solde est calculé par le serveur à partir des acomptes réellement payés.'}
                </p>
                <details className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <summary className="cursor-pointer font-medium text-slate-700">
                    Comment est-ce calculé ?
                  </summary>
                  <p className="mt-2">
                    Impôt dû = impôt calculé sur la déclaration. On déduit ensuite les acomptes
                    réellement payés (AC1, AC2, acomptes de douane et marchés publics) puis le crédit
                    de l’exercice précédent. Un acompte exigible non payé n’est pas déduit. Le crédit
                    restant est reporté, jamais remboursé.
                  </p>
                </details>
              </div>
            ) : (
              <div className={aCredit ? 'grid gap-4 sm:grid-cols-2' : ''}>
                <div>
                  <label
                    htmlFor="impot-calcule"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Impôt principal (Ar)
                  </label>
                  <input
                    id="impot-calcule"
                    type="text"
                    readOnly
                    value={impotRetenu !== null ? formatMontant(impotRetenu) : ''}
                    placeholder={
                      chargementPreview ? 'Calcul en cours…' : 'Renseignez les champs ci-dessus'
                    }
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Ce montant est calculé par le serveur à partir des règles fiscales en vigueur :
                    il n’est pas modifiable.
                  </p>
                </div>
                {aCredit && (
                  <Alert variante="succes" titre={codeImpot === 'TVA' ? 'Crédit de TVA à reporter' : 'Crédit fiscal'}>
                    <p className="text-xl font-bold">{formatMontant(creditFiscal)}</p>
                    <p className="mt-1 text-xs">
                      Votre {codeImpot === 'TVA' ? 'TVA nette est négative' : 'crédit est positif'} :
                      vous n’avez rien à payer. Ce crédit est reporté sur votre prochaine déclaration.
                    </p>
                  </Alert>
                )}
              </div>
            )}

            {previewAffiche?.explication && (
              <p className="mt-3 flex gap-2 text-xs text-slate-600">
                <Info className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <span>{previewAffiche.explication}</span>
              </p>
            )}

            {!chargementPreview && !pret && (
              <p className="mt-3 text-xs text-slate-500">
                Renseignez les champs obligatoires (marqués d’un <span className="text-danger">*</span>)
                pour obtenir le montant de l’impôt.
              </p>
            )}

            {previewAffiche?.disponible === false && (
              <Alert variante="avertissement" titre="Calcul impossible" className="mt-3">
                {previewAffiche.explication ||
                  'Aucun montant ne peut être calculé pour cette déclaration.'}
              </Alert>
            )}

            {previewAffiche?.avertissements?.length > 0 && (
              <Alert variante="avertissement" titre="Points d’attention" className="mt-3">
                <ul className="list-inside list-disc space-y-1">
                  {previewAffiche.avertissements.map((avertissement) => (
                    <li key={avertissement}>{avertissement}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {previewAffiche?.etapesCalcul?.length > 0 && (
              <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <summary className="cursor-pointer font-medium">Détail du calcul</summary>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {previewAffiche.etapesCalcul.map((etape) => (
                    <li key={etape}>{etape}</li>
                  ))}
                </ul>
              </details>
            )}

            {pret && erreurPreview && (
              <Alert variante="danger" titre="Calcul indisponible" className="mt-3">
                {erreurPreview.message}
              </Alert>
            )}
          </SectionCard>
        )}

        {erreurEnvoi && (
          <Alert variante="danger" titre="Dépôt impossible">
            {erreurEnvoi.message}
            {Object.keys(champsEnvoi).length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs">
                {Object.entries(champsEnvoi).map(([champ, message]) => (
                  <li key={champ}>
                    <span className="font-semibold">{champ}</span> : {message}
                  </li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} disabled={envoi}>
            Annuler
          </Button>
          <Button type="submit" disabled={!peutDeposer} chargement={envoi}>
            {estAcompte ? 'Déposer l’acompte' : 'Déposer la déclaration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
