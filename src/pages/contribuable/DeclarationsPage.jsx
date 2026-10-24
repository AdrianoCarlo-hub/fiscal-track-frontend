import { useMemo, useState } from 'react';
import { FileText, Info } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import useApiData, { useListView } from '../../hooks/useApiData';
import declarationService from '../../services/declarationService';
import obligationService from '../../services/obligationService';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import DetailList from '../../components/ui/DetailList';
import Alert from '../../components/ui/Alert';
import { formatDate, formatDateHeure, formatMontant } from '../../utils/formatUtils';
import { libelleImpot } from '../../utils/fiscalConstants';

async function chargerDeclarations(nif) {
  const [declarations, obligations] = await Promise.all([
    declarationService.parContribuable(nif),
    obligationService.parContribuable(nif),
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

export default function DeclarationsPage() {
  const { utilisateur } = useAuth();
  const [selection, setSelection] = useState(null);

  const { data, chargement, erreur, recharger } = useApiData(
    () => chargerDeclarations(utilisateur.identifiant),
    [utilisateur.identifiant],
    { valeurInitiale: [] },
  );

  const declarations = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const { query, setQuery, clear, setPage, items, filteredCount, pagination } = useListView(
    declarations,
    10,
  );

  const colonnes = [
    {
      cle: 'impot',
      label: 'Impôt / période',
      render: (declaration) => (
        <div>
          <p className="font-medium text-slate-800">
            {declaration.obligation ? libelleImpot(declaration.obligation.codeImpot) : 'Déclaration'}
          </p>
          <p className="text-xs text-slate-500">
            {declaration.obligation?.periodeFiscale || `Obligation n°${declaration.idObligationFiscale}`}
          </p>
        </div>
      ),
    },
    {
      cle: 'chiffreAffairesDeclare',
      label: 'Chiffre d’affaires déclaré',
      align: 'right',
      render: (declaration) => (
        <span className="fiscal-money">{formatMontant(declaration.chiffreAffairesDeclare)}</span>
      ),
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
      render: (declaration) => (
        <div>
          <p>{formatDate(declaration.dateSoumission)}</p>
          <p className="text-xs text-slate-500">
            Réf. #{declaration.idDeclaration}
          </p>
        </div>
      ),
    },
    {
      cle: 'statutValidation',
      label: 'Statut',
      render: (declaration) => (
        <div>
          <StatutBadge famille="statutValidation" code={declaration.statutValidation} />
          {declaration.statutValidation === 'REJETEE' && declaration.motifRejet && (
            <p className="mt-1 max-w-xs text-xs text-danger">{declaration.motifRejet}</p>
          )}
        </div>
      ),
    },
    {
      cle: 'actions',
      label: 'Détail',
      align: 'right',
      render: (declaration) => (
        <Button variant="ghost" size="sm" onClick={() => setSelection(declaration)}>
          <FileText className="h-4 w-4" aria-hidden="true" />
          Consulter
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Mes déclarations"
        description="Historique des déclarations déposées auprès de votre centre fiscal, avec le détail du calcul effectué par l’administration."
        fil={[{ libelle: 'Mon espace fiscal' }, { libelle: 'Mes déclarations' }]}
      />

      <Alert variante="info" titre="Calcul de l’impôt" className="mb-5">
        Le montant d’impôt affiché est calculé par le serveur au moment du dépôt. Il ne peut pas
        être modifié depuis cette page.
      </Alert>

      <SectionCard padding={false}>
        <div className="p-5">
          <ListToolbar
            value={query}
            onChange={setQuery}
            placeholder="Rechercher par référence, impôt, montant ou date…"
            count={filteredCount}
          />
          <DataTable
            colonnes={colonnes}
            donnees={items}
            chargement={chargement}
            erreur={erreur}
            onReessayer={recharger}
            pagination={pagination}
            onPageChange={setPage}
            rechercheActive={!!query}
            onEffacerRecherche={clear}
            titreVide="Aucune déclaration déposée"
            descriptionVide="Vous n’avez pas encore déposé de déclaration. Rendez-vous dans « Mes obligations » pour commencer."
            cleLigne={(declaration) => declaration.idDeclaration}
          />
        </div>
      </SectionCard>

      <Modal
        ouvert={!!selection}
        onClose={() => setSelection(null)}
        titre="Détail de la déclaration"
        description={selection?.obligation ? `${libelleImpot(selection.obligation.codeImpot)} · ${selection.obligation.periodeFiscale}` : ''}
        taille="lg"
        pied={
          <Button variant="ghost" onClick={() => setSelection(null)}>
            Fermer
          </Button>
        }
      >
        {selection && (
          <div className="space-y-5">
            <DetailList
              colonnes={2}
              elements={[
                { libelle: 'Référence', valeur: `#${selection.idDeclaration}` },
                {
                  libelle: 'Obligation',
                  valeur: selection.obligation
                    ? `${libelleImpot(selection.obligation.codeImpot)} — ${selection.obligation.periodeFiscale}`
                    : `n°${selection.idObligationFiscale}`,
                },
                { libelle: 'Chiffre d’affaires déclaré', valeur: formatMontant(selection.chiffreAffairesDeclare) },
                { libelle: 'Impôt principal calculé', valeur: formatMontant(selection.impotPrincipalCalcule) },
                { libelle: 'Date de soumission', valeur: formatDateHeure(selection.dateSoumission) },
                {
                  libelle: 'Statut de validation',
                  valeur: <StatutBadge famille="statutValidation" code={selection.statutValidation} />,
                },
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
                {selection.motifRejet || 'Aucun motif n’a été précisé. Contactez votre centre fiscal.'}
              </Alert>
            )}

            {selection.statutValidation === 'EN_ATTENTE_VALIDATION' && (
              <Alert variante="avertissement" titre="Déclaration en cours d’instruction">
                <span className="inline-flex items-center gap-2">
                  <Info className="h-4 w-4" aria-hidden="true" />
                  Votre déclaration sera examinée par un agent. Vous serez notifié de la décision.
                </span>
              </Alert>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
