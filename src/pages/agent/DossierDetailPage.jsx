import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FilePlus2, Pencil } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { peut } from '../../auth/permissions';
import contribuableService from '../../services/contribuableService';
import obligationService from '../../services/obligationService';
import compteCourantService from '../../services/compteCourantService';
import useApiData, { useListView } from '../../hooks/useApiData';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DetailList from '../../components/ui/DetailList';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import ObligationForm from '../../components/forms/ObligationForm';
import ContribuableForm from '../../components/forms/ContribuableForm';
import ListeAcomptesObligatoires from '../../components/acomptes/ListeAcomptesObligatoires';
import { formatDate, formatMontant } from '../../utils/formatUtils';
import { libelle } from '../../utils/libelles';
import { libelleImpot } from '../../utils/fiscalConstants';

async function chargerDossier(nif) {
  const [contribuable, obligations, comptes] = await Promise.all([
    contribuableService.parNif(nif),
    obligationService.parContribuable(nif),
    compteCourantService.parContribuable(nif),
  ]);
  return {
    contribuable,
    obligations: Array.isArray(obligations) ? obligations : [],
    comptes: Array.isArray(comptes) ? comptes : [],
  };
}

export default function DossierDetailPage() {
  const { nif } = useParams();
  const { utilisateur } = useAuth();
  const [onglet, setOnglet] = useState('OBLIGATIONS');
  const [modalObligation, setModalObligation] = useState(false);
  const [modalModification, setModalModification] = useState(false);

  const { data, chargement, erreur, recharger } = useApiData(
    () => chargerDossier(nif),
    [nif],
  );

  const obligations = data?.obligations || [];
  const comptes = data?.comptes || [];
  const vueObligations = useListView(obligations, 10);
  const vueComptes = useListView(comptes, 10);

  if (chargement) {
    return (
      <div>
        <PageHeader titre="Dossier contribuable" fil={[{ libelle: 'Dossiers' }]} />
        <LoadingState lignes={5} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div>
        <PageHeader titre="Dossier contribuable" fil={[{ libelle: 'Dossiers' }]} />
        <ErrorState erreur={erreur} onReessayer={recharger} />
      </div>
    );
  }

  const contribuable = data.contribuable;

  const colonnesObligations = [
    {
      cle: 'codeImpot',
      label: 'Impôt',
      render: (obligation) => (
        <div>
          <p className="font-medium text-slate-800">{libelleImpot(obligation.codeImpot)}</p>
          <p className="text-xs text-slate-500">Période {obligation.periodeFiscale}</p>
        </div>
      ),
    },
    {
      cle: 'dateLimiteReelle',
      label: 'Échéance',
      render: (obligation) => formatDate(obligation.dateLimiteReelle),
    },
    {
      cle: 'statutDeclaration',
      label: 'Statut',
      render: (obligation) => (
        <StatutBadge famille="statutDeclaration" code={obligation.statutDeclaration} />
      ),
    },
    {
      cle: 'depot',
      label: 'Déposée le',
      render: (obligation) =>
        obligation.dateDepotEffectif ? formatDate(obligation.dateDepotEffectif) : '—',
    },
  ];

  const colonnesComptes = [
    {
      cle: 'idCompte',
      label: 'Compte',
      render: (compte) => (
        <div>
          <p className="font-medium text-slate-800">Compte n°{compte.idCompte}</p>
          <p className="text-xs text-slate-500">Déclaration n°{compte.idDeclaration}</p>
        </div>
      ),
    },
    {
      cle: 'montantTotalDu',
      label: 'Total dû',
      align: 'right',
      render: (compte) => formatMontant(compte.montantTotalDu),
    },
    {
      cle: 'montantPaye',
      label: 'Payé',
      align: 'right',
      render: (compte) => (
        <span className="fiscal-money text-success">{formatMontant(compte.montantPaye)}</span>
      ),
    },
    {
      cle: 'resteARecouvrer',
      label: 'Reste',
      align: 'right',
      render: (compte) => (
        <span
          className={`fiscal-money font-semibold ${
            Number(compte.resteARecouvrer || 0) > 0 ? 'text-danger' : 'text-slate-700'
          }`}
        >
          {formatMontant(compte.resteARecouvrer)}
        </span>
      ),
    },
    {
      cle: 'statutRecouvrement',
      label: 'Statut',
      render: (compte) => (
        <StatutBadge famille="statutRecouvrement" code={compte.statutRecouvrement} />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/agent/dossiers"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux dossiers
        </Link>
      </div>

      <PageHeader
        titre={contribuable.raisonSociale}
        description={`NIF ${contribuable.nif}`}
        fil={[
          { libelle: 'Dossiers contribuables', lien: '/agent/dossiers' },
          { libelle: contribuable.nif },
        ]}
        actions={
          <>
            {peut(utilisateur?.role, 'contribuable.gerer') && (
              <Button variant="ghost" onClick={() => setModalModification(true)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Modifier
              </Button>
            )}
            {peut(utilisateur?.role, 'obligation.generer') && (
              <Button onClick={() => setModalObligation(true)}>
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                Générer une obligation
              </Button>
            )}
          </>
        }
      />

      <SectionCard className="mb-5">
        <DetailList
          colonnes={3}
          elements={[
            { libelle: 'Forme juridique', valeur: libelle('formeJuridique', contribuable.formeJuridique) },
            { libelle: 'Régime', valeur: libelle('regimeImposition', contribuable.regimeImposition) },
            {
              libelle: 'Obligation comptable',
              valeur: libelle('obligationComptable', contribuable.obligationComptable),
            },
            { libelle: 'Statut', valeur: <StatutBadge famille="statutActivite" code={contribuable.statutActivite} /> },
            { libelle: 'Date d’immatriculation', valeur: formatDate(contribuable.dateImmatriculation) },
            { libelle: 'Catégorie d’activité', valeur: libelle('categorieActivite', contribuable.categorieActivite) },
            { libelle: 'Adresse', valeur: contribuable.adresseContribuable },
            { libelle: 'Commune', valeur: contribuable.communeContribuable },
            { libelle: 'E-mail', valeur: contribuable.emailContribuable },
            { libelle: 'Téléphone', valeur: contribuable.telephoneContribuable },
            { libelle: 'Dirigeant', valeur: [contribuable.prenomDirigeant, contribuable.nomDirigeant].filter(Boolean).join(' ') || null },
            { libelle: 'CIN du dirigeant', valeur: contribuable.cinDirigeant },
          ]}
        />
      </SectionCard>

      <SectionCard padding={false}>
        <div className="px-5 pt-3">
          <Tabs
            actif={onglet}
            onChange={setOnglet}
            onglets={[
              { cle: 'OBLIGATIONS', libelle: 'Obligations', compteur: obligations.length },
              { cle: 'COMPTES', libelle: 'Comptes courants', compteur: comptes.length },
              { cle: 'ACOMPTES', libelle: 'Acomptes' },
            ]}
          />
        </div>

        <div className="p-5">
          {onglet === 'OBLIGATIONS' && (
            <>
              <ListToolbar
                value={vueObligations.query}
                onChange={vueObligations.setQuery}
                placeholder="Rechercher par impôt, période ou statut…"
                count={vueObligations.filteredCount}
              />
              <DataTable
                colonnes={colonnesObligations}
                donnees={vueObligations.items}
                pagination={vueObligations.pagination}
                onPageChange={vueObligations.setPage}
                rechercheActive={!!vueObligations.query}
                onEffacerRecherche={vueObligations.clear}
                titreVide="Aucune obligation"
                descriptionVide="Aucune obligation fiscale n’a encore été générée pour ce dossier."
                cleLigne={(obligation) => obligation.idObligationFiscale}
              />
            </>
          )}

          {onglet === 'COMPTES' && (
            <>
              <ListToolbar
                value={vueComptes.query}
                onChange={vueComptes.setQuery}
                placeholder="Rechercher par compte ou statut…"
                count={vueComptes.filteredCount}
              />
              <DataTable
                colonnes={colonnesComptes}
                donnees={vueComptes.items}
                pagination={vueComptes.pagination}
                onPageChange={vueComptes.setPage}
                rechercheActive={!!vueComptes.query}
                onEffacerRecherche={vueComptes.clear}
                titreVide="Aucun compte courant"
                descriptionVide="Aucun compte courant fiscal n’est ouvert pour ce dossier."
                cleLigne={(compte) => compte.idCompte}
              />
            </>
          )}

          {onglet === 'ACOMPTES' && (
            <ListeAcomptesObligatoires
              nif={nif}
              titre={`Acomptes obligatoires de ${contribuable.raisonSociale}`}
              description="Acomptes IR et IS de l’exercice en cours, avec le total restant à payer."
            />
          )}
        </div>
      </SectionCard>

      {modalObligation && (
        <ObligationForm
          nif={nif}
          onClose={() => setModalObligation(false)}
          onSuccess={() => {
            setModalObligation(false);
            recharger();
          }}
        />
      )}

      {modalModification && (
        <ContribuableForm
          contribuable={contribuable}
          onClose={() => setModalModification(false)}
          onSuccess={() => {
            setModalModification(false);
            recharger();
          }}
        />
      )}
    </div>
  );
}
