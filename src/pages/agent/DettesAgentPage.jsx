import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import compteCourantService from '../../services/compteCourantService';
import useApiData, { useListView } from '../../hooks/useApiData';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Alert from '../../components/ui/Alert';
import { formatDate, formatMontant } from '../../utils/formatUtils';

export default function DettesAgentPage() {
  const { data, chargement, erreur, recharger } = useApiData(
    () => compteCourantService.nonSoldes(),
    [],
    { valeurInitiale: [] },
  );

  const comptes = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const total = useMemo(
    () => comptes.reduce((somme, compte) => somme + Number(compte.resteARecouvrer || 0), 0),
    [comptes],
  );
  const penalites = useMemo(
    () => comptes.reduce((somme, compte) => somme + Number(compte.montantPenalites || 0), 0),
    [comptes],
  );
  const titresEmis = comptes.filter((compte) => compte.statutRecouvrement === 'TITRE_EMIS').length;
  const atd = comptes.filter((compte) => compte.statutRecouvrement === 'ATD_LANCE').length;

  const vue = useListView(comptes, 10);

  const colonnes = [
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
      cle: 'nif',
      label: 'NIF',
      render: (compte) => (
        <Link
          to={`/agent/dossiers/${compte.nif}`}
          className="font-mono text-sm font-medium text-primary hover:underline"
        >
          {compte.nif}
        </Link>
      ),
    },
    {
      cle: 'dateCreationLigne',
      label: 'Ouvert le',
      render: (compte) => formatDate(compte.dateCreationLigne),
    },
    {
      cle: 'montantTotalDu',
      label: 'Total dû',
      align: 'right',
      render: (compte) => formatMontant(compte.montantTotalDu),
    },
    {
      cle: 'montantPenalites',
      label: 'Pénalités',
      align: 'right',
      render: (compte) => (
        <span className={Number(compte.montantPenalites || 0) > 0 ? 'text-danger' : 'text-slate-600'}>
          {formatMontant(compte.montantPenalites)}
        </span>
      ),
    },
    {
      cle: 'resteARecouvrer',
      label: 'Reste à recouvrer',
      align: 'right',
      render: (compte) => (
        <span className="fiscal-money font-semibold text-danger">
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
        titre="Suivi des dettes"
        description="Comptes courants fiscaux non soldés et actions de recouvrement en cours."
        fil={[{ libelle: 'Espace agent' }, { libelle: 'Dettes' }]}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SectionCard>
          <p className="text-sm text-slate-500">Total à recouvrer</p>
          <p className="fiscal-money mt-1 text-2xl font-semibold text-danger">
            {formatMontant(total)}
          </p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-500">Comptes non soldés</p>
          <p className="mt-1 text-3xl font-semibold text-slate-800">{comptes.length}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-500">Titres émis</p>
          <p className="mt-1 text-3xl font-semibold text-slate-800">{titresEmis}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-500">Avis à tiers détenteur</p>
          <p className="mt-1 text-3xl font-semibold text-danger">{atd}</p>
        </SectionCard>
      </div>

      <Alert variante="info" titre="Pénalités cumulées" className="mb-5">
        Les comptes non soldés totalisent {formatMontant(penalites)} de pénalités. Le recouvrement
        forcé est déclenché par le service compétent selon les procédures en vigueur.
      </Alert>

      <SectionCard padding={false}>
        <div className="p-5">
          <ListToolbar
            value={vue.query}
            onChange={vue.setQuery}
            placeholder="Rechercher par compte, NIF ou statut…"
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
            titreVide="Aucune dette"
            descriptionVide="Tous les comptes courants fiscaux sont soldés."
            cleLigne={(compte) => compte.idCompte}
          />
        </div>
      </SectionCard>
    </div>
  );
}
