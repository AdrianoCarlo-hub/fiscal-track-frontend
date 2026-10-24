import { useMemo, useState } from 'react';
import { CheckCircle2, FileText, XCircle } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { peut } from '../../auth/permissions';
import declarationService from '../../services/declarationService';
import obligationService from '../../services/obligationService';
import useApiData, { useListView } from '../../hooks/useApiData';
import { useToast, useConfirm } from '../../context/notificationContext';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import DetailList from '../../components/ui/DetailList';
import { Textarea } from '../../components/ui/FormControls';
import { formatDateHeure, formatMontant } from '../../utils/formatUtils';
import { libelleImpot } from '../../utils/fiscalConstants';

async function chargerDeclarations() {
  const [declarations, obligations] = await Promise.all([
    declarationService.lister(),
    obligationService.lister(),
  ]);
  const obligationsParId = new Map(
    (Array.isArray(obligations) ? obligations : []).map((obligation) => [
      obligation.idObligationFiscale,
      obligation,
    ]),
  );
  return (Array.isArray(declarations) ? declarations : []).map((declaration) => ({
    ...declaration,
    obligation: obligationsParId.get(declaration.idObligationFiscale) || null,
  }));
}

export default function DeclarationsAgentPage() {
  const { utilisateur } = useAuth();
  const { notifier } = useToast();
  const confirmer = useConfirm();

  const [filtre, setFiltre] = useState('EN_ATTENTE_VALIDATION');
  const [selection, setSelection] = useState(null);
  const [rejet, setRejet] = useState(null);
  const [motifRejet, setMotifRejet] = useState('');
  const [enCoursId, setEnCoursId] = useState(null);
  const peutInstruire = peut(utilisateur?.role, 'declaration.instruire');

  const { data, chargement, erreur, recharger } = useApiData(chargerDeclarations, [], {
    valeurInitiale: [],
  });

  const declarations = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const compteurs = useMemo(
    () => ({
      TOUTES: declarations.length,
      EN_ATTENTE_VALIDATION: declarations.filter(
        (declaration) => declaration.statutValidation === 'EN_ATTENTE_VALIDATION',
      ).length,
      VALIDEE: declarations.filter((declaration) => declaration.statutValidation === 'VALIDEE').length,
      REJETEE: declarations.filter((declaration) => declaration.statutValidation === 'REJETEE').length,
    }),
    [declarations],
  );

  const filtrees = useMemo(
    () =>
      filtre === 'TOUTES'
        ? declarations
        : declarations.filter((declaration) => declaration.statutValidation === filtre),
    [declarations, filtre],
  );

  const vue = useListView(filtrees, 10);

  const valider = async (declaration) => {
    const confirme = await confirmer({
      titre: 'Valider la déclaration',
      message: `Confirmez-vous la validation de la déclaration n°${declaration.idDeclaration} ? Le contribuable sera notifié.`,
      libelleConfirmer: 'Valider',
      variante: 'primary',
    });
    if (!confirme) return;
    setEnCoursId(declaration.idDeclaration);
    try {
      await declarationService.valider(declaration.idDeclaration);
      notifier({
        variante: 'succes',
        titre: 'Déclaration validée',
        message: `La déclaration n°${declaration.idDeclaration} a été validée.`,
      });
      await recharger();
    } catch (err) {
      notifier({
        variante: 'danger',
        titre: 'Validation impossible',
        message: err?.message || 'La déclaration n’a pas pu être validée.',
      });
    } finally {
      setEnCoursId(null);
    }
  };

  const ouvrirRejet = (declaration) => {
    setRejet(declaration);
    setMotifRejet('');
  };

  const confirmerRejet = async () => {
    if (!motifRejet.trim() || !rejet) return;
    setEnCoursId(rejet.idDeclaration);
    try {
      await declarationService.rejeter(rejet.idDeclaration, motifRejet.trim());
      notifier({
        variante: 'succes',
        titre: 'Déclaration rejetée',
        message: 'Le motif a été transmis au contribuable.',
      });
      setRejet(null);
      setMotifRejet('');
      await recharger();
    } catch (err) {
      notifier({
        variante: 'danger',
        titre: 'Rejet impossible',
        message: err?.message || 'La déclaration n’a pas pu être rejetée.',
      });
    } finally {
      setEnCoursId(null);
    }
  };

  const colonnes = [
    {
      cle: 'reference',
      label: 'Déclaration',
      render: (declaration) => (
        <div>
          <p className="font-medium text-slate-800">Déclaration n°{declaration.idDeclaration}</p>
          <p className="text-xs text-slate-500">
            {declaration.obligation
              ? `${libelleImpot(declaration.obligation.codeImpot)} · ${declaration.obligation.periodeFiscale}`
              : `Obligation n°${declaration.idObligationFiscale}`}
          </p>
        </div>
      ),
    },
    {
      cle: 'chiffreAffairesDeclare',
      label: 'Chiffre d’affaires',
      align: 'right',
      render: (declaration) => formatMontant(declaration.chiffreAffairesDeclare),
    },
    {
      cle: 'impotPrincipalCalcule',
      label: 'Impôt calculé',
      align: 'right',
      render: (declaration) => (
        <span className="fiscal-money font-semibold text-slate-800">
          {formatMontant(declaration.impotPrincipalCalcule)}
        </span>
      ),
    },
    {
      cle: 'dateSoumission',
      label: 'Soumission',
      render: (declaration) => formatDateHeure(declaration.dateSoumission),
    },
    {
      cle: 'statutValidation',
      label: 'Statut',
      render: (declaration) => (
        <div>
          <StatutBadge famille="statutValidation" code={declaration.statutValidation} />
          {declaration.motifRejet && (
            <p className="mt-1 max-w-[220px] text-xs text-danger">{declaration.motifRejet}</p>
          )}
        </div>
      ),
    },
    {
      cle: 'actions',
      label: 'Actions',
      align: 'right',
      render: (declaration) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelection(declaration)}>
            <FileText className="h-4 w-4" aria-hidden="true" />
            Détail
          </Button>
          {peutInstruire && declaration.statutValidation === 'EN_ATTENTE_VALIDATION' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => valider(declaration)}
                disabled={enCoursId === declaration.idDeclaration}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Valider
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => ouvrirRejet(declaration)}
                disabled={enCoursId === declaration.idDeclaration}
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Rejeter
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Instruction des déclarations"
        description="Contrôlez les déclarations déposées et validez ou rejetez-les avec un motif."
        fil={[{ libelle: 'Espace agent' }, { libelle: 'Déclarations' }]}
      />

      {!peutInstruire && (
        <Alert variante="info" titre="Consultation seule" className="mb-5">
          Votre rôle permet de consulter les déclarations, mais pas de les valider ou de les
          rejeter. Seuls les agents de gestion, les responsables et les administrateurs peuvent
          instruire un dossier.
        </Alert>
      )}

      <SectionCard padding={false}>
        <div className="px-5 pt-3">
          <Tabs
            actif={filtre}
            onChange={(valeur) => {
              setFiltre(valeur);
              vue.setPage(0);
            }}
            onglets={[
              { cle: 'EN_ATTENTE_VALIDATION', libelle: 'En attente', compteur: compteurs.EN_ATTENTE_VALIDATION },
              { cle: 'VALIDEE', libelle: 'Validées', compteur: compteurs.VALIDEE },
              { cle: 'REJETEE', libelle: 'Rejetées', compteur: compteurs.REJETEE },
              { cle: 'TOUTES', libelle: 'Toutes', compteur: compteurs.TOUTES },
            ]}
          />
        </div>
        <div className="p-5">
          <ListToolbar
            value={vue.query}
            onChange={vue.setQuery}
            placeholder="Rechercher par référence, NIF, montant ou date…"
            count={vue.filteredCount}
          />
          <DataTable
            colonnes={colonnes}
            donnees={vue.items}
            chargement={chargement}
            erreur={erreur}
            onReessayer={recharger}
            pagination={vue.pagination}
            onPageChange={vue.setPage}
            rechercheActive={!!vue.query}
            onEffacerRecherche={vue.clear}
            titreVide="Aucune déclaration"
            descriptionVide="Aucune déclaration ne correspond à ce filtre."
            cleLigne={(declaration) => declaration.idDeclaration}
          />
        </div>
      </SectionCard>

      <Modal
        ouvert={!!selection}
        onClose={() => setSelection(null)}
        titre="Détail de la déclaration"
        description={selection ? `Déclaration n°${selection.idDeclaration}` : ''}
        taille="lg"
        pied={
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setSelection(null)}>
              Fermer
            </Button>
          </div>
        }
      >
        {selection && (
          <div className="space-y-5">
            <DetailList
              colonnes={2}
              elements={[
                {
                  libelle: 'Impôt / période',
                  valeur: selection.obligation
                    ? `${libelleImpot(selection.obligation.codeImpot)} — ${selection.obligation.periodeFiscale}`
                    : `Obligation n°${selection.idObligationFiscale}`,
                },
                { libelle: 'NIF', valeur: selection.obligation?.nif },
                {
                  libelle: 'Statut de validation',
                  valeur: <StatutBadge famille="statutValidation" code={selection.statutValidation} />,
                },
                { libelle: 'Date de soumission', valeur: formatDateHeure(selection.dateSoumission) },
                { libelle: 'Chiffre d’affaires déclaré', valeur: formatMontant(selection.chiffreAffairesDeclare) },
                { libelle: 'Impôt principal calculé', valeur: formatMontant(selection.impotPrincipalCalcule) },
                { libelle: 'Crédit fiscal', valeur: formatMontant(selection.creditFiscal) },
                { libelle: 'Crédit utilisé', valeur: formatMontant(selection.creditUtilise) },
              ]}
            />

            {selection.detailCalcul && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Détail du calcul
                </p>
                <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                  {selection.detailCalcul}
                </pre>
              </div>
            )}

            {selection.statutValidation === 'REJETEE' && (
              <Alert variante="danger" titre="Motif du rejet">
                {selection.motifRejet || 'Aucun motif précisé.'}
              </Alert>
            )}
          </div>
        )}
      </Modal>

      <Modal
        ouvert={!!rejet}
        onClose={() => setRejet(null)}
        titre="Rejeter la déclaration"
        description={rejet ? `Déclaration n°${rejet.idDeclaration}` : ''}
        pied={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setRejet(null)} disabled={!!enCoursId}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={confirmerRejet}
              disabled={!motifRejet.trim() || !!enCoursId}
              chargement={enCoursId === rejet?.idDeclaration}
            >
              Confirmer le rejet
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Alert variante="avertissement" titre="Le motif sera visible par le contribuable">
            Expliquez précisément ce qui doit être corrigé. Le contribuable pourra consulter ce
            motif depuis son espace et déposer une nouvelle déclaration si nécessaire.
          </Alert>
          <Textarea
            id="motif-rejet"
            label="Motif du rejet"
            obligatoire
            rows={4}
            value={motifRejet}
            onChange={(evenement) => setMotifRejet(evenement.target.value)}
            placeholder="Ex. Le chiffre d’affaires déclaré ne correspond pas aux pièces justificatives fournies."
          />
        </div>
      </Modal>
    </div>
  );
}
