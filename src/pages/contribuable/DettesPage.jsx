import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, TriangleAlert } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import useApiData, { useListView } from '../../hooks/useApiData';
import compteCourantService from '../../services/compteCourantService';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Alert from '../../components/ui/Alert';
import { formatDate, formatMontant } from '../../utils/formatUtils';

export default function DettesPage() {
  const { utilisateur } = useAuth();

  const { data, chargement, erreur, recharger } = useApiData(
    () => compteCourantService.parContribuable(utilisateur.identifiant),
    [utilisateur.identifiant],
    { valeurInitiale: [] },
  );

  const dettes = useMemo(() => {
    const comptes = Array.isArray(data) ? data : [];
    return comptes
      .filter((compte) => Number(compte.resteARecouvrer || 0) > 0)
      .sort((a, b) => Number(b.resteARecouvrer || 0) - Number(a.resteARecouvrer || 0));
  }, [data]);

  const total = useMemo(
    () => dettes.reduce((somme, dette) => somme + Number(dette.resteARecouvrer || 0), 0),
    [dettes],
  );

  const penalites = useMemo(
    () => dettes.reduce((somme, dette) => somme + Number(dette.montantPenalites || 0), 0),
    [dettes],
  );

  const { query, setQuery, clear, setPage, items, filteredCount, pagination } = useListView(
    dettes,
    10,
  );

  const colonnes = [
    {
      cle: 'idCompte',
      label: 'Compte',
      render: (dette) => (
        <div>
          <p className="font-medium text-slate-800">Compte n°{dette.idCompte}</p>
          <p className="text-xs text-slate-500">
            Déclaration n°{dette.idDeclaration} · ouvert le {formatDate(dette.dateCreationLigne)}
          </p>
        </div>
      ),
    },
    {
      cle: 'montantPrincipal',
      label: 'Principal',
      align: 'right',
      render: (dette) => formatMontant(dette.montantPrincipal),
    },
    {
      cle: 'montantPenalites',
      label: 'Pénalités',
      align: 'right',
      render: (dette) => (
        <span className={Number(dette.montantPenalites || 0) > 0 ? 'text-danger' : 'text-slate-600'}>
          {formatMontant(dette.montantPenalites)}
        </span>
      ),
    },
    {
      cle: 'montantPaye',
      label: 'Déjà payé',
      align: 'right',
      render: (dette) => (
        <span className="fiscal-money text-success">{formatMontant(dette.montantPaye)}</span>
      ),
    },
    {
      cle: 'resteARecouvrer',
      label: 'Reste à payer',
      align: 'right',
      render: (dette) => (
        <span className="fiscal-money font-semibold text-danger">
          {formatMontant(dette.resteARecouvrer)}
        </span>
      ),
    },
    {
      cle: 'statutRecouvrement',
      label: 'Statut',
      render: (dette) => (
        <StatutBadge famille="statutRecouvrement" code={dette.statutRecouvrement} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Mes dettes fiscales"
        description="Situation des montants restant à recouvrer sur vos comptes courants fiscaux."
        fil={[{ libelle: 'Mon espace fiscal' }, { libelle: 'Mes dettes' }]}
        actions={
          <Link
            to="/contribuable/paiements"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Voir mes paiements
          </Link>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <SectionCard>
          <p className="text-sm text-slate-500">Total restant à payer</p>
          <p className="fiscal-money mt-1 text-3xl font-semibold text-danger">
            {formatMontant(total)}
          </p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-500">Comptes non soldés</p>
          <p className="mt-1 text-3xl font-semibold text-slate-800">{dettes.length}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-500">Pénalités comprises</p>
          <p className="fiscal-money mt-1 text-3xl font-semibold text-slate-800">
            {formatMontant(penalites)}
          </p>
        </SectionCard>
      </div>

      {!chargement && !erreur && dettes.length === 0 ? (
        <Alert variante="succes" titre="Aucune dette en cours">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Tous vos comptes courants fiscaux sont soldés. Aucun montant n’est restant à recouvrer.
          </span>
        </Alert>
      ) : (
        <SectionCard padding={false}>
          <div className="p-5">
            <ListToolbar
              value={query}
              onChange={setQuery}
              placeholder="Rechercher un compte ou un statut…"
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
              titreVide="Aucune dette"
              descriptionVide="Aucun montant n’est restant à recouvrer pour votre dossier."
              cleLigne={(dette) => dette.idCompte}
            />
          </div>
        </SectionCard>
      )}

      {!chargement && !erreur && dettes.length > 0 && (
        <Alert variante="avertissement" titre="Régularisation de votre situation" className="mt-5">
          <span className="inline-flex items-start gap-2">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Les pénalités peuvent continuer à courir. Rapprochez-vous de votre centre fiscal pour
            connaître les modalités de paiement et éviter un recouvrement forcé.
          </span>
        </Alert>
      )}
    </div>
  );
}
