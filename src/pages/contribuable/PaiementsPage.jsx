import { useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import useApiData, { useListView } from '../../hooks/useApiData';
import compteCourantService from '../../services/compteCourantService';
import paiementService from '../../services/paiementService';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Tabs from '../../components/ui/Tabs';
import Alert from '../../components/ui/Alert';
import { formatDate, formatDateHeure, formatMontant } from '../../utils/formatUtils';
import { libelle } from '../../utils/libelles';

async function chargerEspacePaiement(nif) {
  const comptes = await compteCourantService.parContribuable(nif);
  const listeComptes = Array.isArray(comptes) ? comptes : [];
  const resultats = await Promise.allSettled(
    listeComptes.map((compte) =>
      paiementService
        .parCompte(compte.idCompte)
        .then((paiements) =>
          (Array.isArray(paiements) ? paiements : []).map((paiement) => ({ ...paiement, compte })),
        ),
    ),
  );
  const paiements = resultats
    .filter((resultat) => resultat.status === 'fulfilled')
    .flatMap((resultat) => resultat.value)
    .sort((a, b) => new Date(b.datePaiement) - new Date(a.datePaiement));
  return {
    comptes: listeComptes,
    paiements,
    comptesSansHistorique: resultats.filter((resultat) => resultat.status === 'rejected').length,
  };
}

export default function PaiementsPage() {
  const { utilisateur } = useAuth();
  const [onglet, setOnglet] = useState('paiements');

  const { data, chargement, erreur, recharger } = useApiData(
    () => chargerEspacePaiement(utilisateur.identifiant),
    [utilisateur.identifiant],
    { valeurInitiale: { comptes: [], paiements: [], comptesSansHistorique: 0 } },
  );

  const comptes = useMemo(() => data?.comptes || [], [data]);
  const paiements = useMemo(() => data?.paiements || [], [data]);

  const totaux = useMemo(
    () =>
      comptes.reduce(
        (acc, compte) => ({
          du: acc.du + Number(compte.montantTotalDu || 0),
          paye: acc.paye + Number(compte.montantPaye || 0),
          reste: acc.reste + Number(compte.resteARecouvrer || 0),
        }),
        { du: 0, paye: 0, reste: 0 },
      ),
    [comptes],
  );

  const vuePaiements = useListView(paiements, 10);
  const vueComptes = useListView(comptes, 10);

  const colonnesPaiements = [
    {
      cle: 'datePaiement',
      label: 'Date du paiement',
      render: (paiement) => formatDateHeure(paiement.datePaiement),
    },
    {
      cle: 'compte',
      label: 'Compte courant',
      render: (paiement) => (
        <div>
          <p className="font-medium text-slate-800">Compte n°{paiement.idCompte}</p>
          <p className="text-xs text-slate-500">Paiement n°{paiement.idPaiement}</p>
        </div>
      ),
    },
    {
      cle: 'modePaiement',
      label: 'Mode',
      render: (paiement) => libelle('modePaiement', paiement.modePaiement),
    },
    {
      cle: 'referenceTransaction',
      label: 'Référence',
      render: (paiement) =>
        paiement.referenceTransaction ? (
          <span className="font-mono text-xs text-slate-600">{paiement.referenceTransaction}</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      cle: 'montantVerse',
      label: 'Montant versé',
      align: 'right',
      render: (paiement) => (
        <span className="fiscal-money font-semibold text-slate-800">
          {formatMontant(paiement.montantVerse)}
        </span>
      ),
    },
  ];

  const colonnesComptes = [
    {
      cle: 'idCompte',
      label: 'Compte',
      render: (compte) => (
        <div>
          <p className="font-medium text-slate-800">Compte n°{compte.idCompte}</p>
          <p className="text-xs text-slate-500">Créé le {formatDate(compte.dateCreationLigne)}</p>
        </div>
      ),
    },
    {
      cle: 'montantPrincipal',
      label: 'Principal',
      align: 'right',
      render: (compte) => formatMontant(compte.montantPrincipal),
    },
    {
      cle: 'montantPenalites',
      label: 'Pénalités',
      align: 'right',
      render: (compte) => formatMontant(compte.montantPenalites),
    },
    {
      cle: 'montantPaye',
      label: 'Payé',
      align: 'right',
      render: (compte) => (
        <span className="fiscal-money font-medium text-success">
          {formatMontant(compte.montantPaye)}
        </span>
      ),
    },
    {
      cle: 'resteARecouvrer',
      label: 'Reste à payer',
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
      <PageHeader
        titre="Mes paiements"
        description="Suivez les versements enregistrés par votre centre fiscal et la situation de vos comptes courants."
        fil={[{ libelle: 'Mon espace fiscal' }, { libelle: 'Mes paiements' }]}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Kpi libelle="Total dû" valeur={totaux.du} />
        <Kpi libelle="Total versé" valeur={totaux.paye} ton="success" />
        <Kpi libelle="Reste à payer" valeur={totaux.reste} ton={totaux.reste > 0 ? 'danger' : 'neutre'} />
      </div>

      <Alert variante="info" titre="Enregistrement des paiements" className="mb-5">
        Les paiements sont saisis par l’administration fiscale à réception de votre versement.
        Aucun paiement ne peut être déclaré directement depuis cet espace.
      </Alert>

      {data?.comptesSansHistorique > 0 && (
        <Alert variante="avertissement" titre="Historique partiel" className="mb-5">
          L’historique de {data.comptesSansHistorique} compte(s) n’a pas pu être chargé. Les autres paiements restent
          affichés ; actualisez la page pour réessayer.
        </Alert>
      )}

      <SectionCard padding={false}>
        <div className="px-5 pt-3">
          <Tabs
            actif={onglet}
            onChange={setOnglet}
            onglets={[
              { cle: 'paiements', libelle: 'Historique des paiements', compteur: paiements.length },
              { cle: 'comptes', libelle: 'Mes comptes', compteur: comptes.length },
            ]}
          />
        </div>
        <div className="p-5">
          {onglet === 'paiements' ? (
            <>
              <ListToolbar
                value={vuePaiements.query}
                onChange={vuePaiements.setQuery}
                placeholder="Rechercher par compte, mode ou référence…"
                count={vuePaiements.filteredCount}
              />
              <DataTable
                colonnes={colonnesPaiements}
                donnees={vuePaiements.items}
                chargement={chargement}
                erreur={erreur}
                onReessayer={recharger}
                pagination={vuePaiements.pagination}
                onPageChange={vuePaiements.setPage}
                rechercheActive={!!vuePaiements.query}
                onEffacerRecherche={vuePaiements.clear}
                titreVide="Aucun paiement enregistré"
                descriptionVide="Vos versements apparaîtront ici dès qu’ils auront été enregistrés par l’administration."
                cleLigne={(paiement) => paiement.idPaiement}
              />
            </>
          ) : (
            <>
              <ListToolbar
                value={vueComptes.query}
                onChange={vueComptes.setQuery}
                placeholder="Rechercher un compte ou un statut…"
                count={vueComptes.filteredCount}
              />
              <DataTable
                colonnes={colonnesComptes}
                donnees={vueComptes.items}
                chargement={chargement}
                erreur={erreur}
                onReessayer={recharger}
                pagination={vueComptes.pagination}
                onPageChange={vueComptes.setPage}
                rechercheActive={!!vueComptes.query}
                onEffacerRecherche={vueComptes.clear}
                titreVide="Aucun compte courant"
                descriptionVide="Aucun compte courant fiscal n’est encore ouvert pour votre dossier."
                cleLigne={(compte) => compte.idCompte}
              />
            </>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function Kpi({ libelle: intitule, valeur, ton = 'neutre' }) {
  const couleurs = {
    neutre: 'text-slate-800',
    success: 'text-success',
    danger: 'text-danger',
  };
  return (
    <SectionCard>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm text-slate-500">{intitule}</p>
          <p className={`fiscal-money mt-1 text-2xl font-semibold ${couleurs[ton]}`}>
            {formatMontant(valeur)}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
