import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ListChecks } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import useApiData, { useListView } from '../../hooks/useApiData';
import obligationService from '../../services/obligationService';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Tabs from '../../components/ui/Tabs';
import { formatDate, formatEcheanceRelative } from '../../utils/formatUtils';
import { libelleImpot } from '../../utils/fiscalConstants';
import { useState } from 'react';

export default function ObligationsPage() {
  const { utilisateur } = useAuth();
  const [filtre, setFiltre] = useState('TOUS');

  const { data, chargement, erreur, recharger } = useApiData(
    () => obligationService.parContribuable(utilisateur.identifiant),
    [utilisateur.identifiant],
    { valeurInitiale: [] },
  );

  const obligations = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const compteurs = useMemo(
    () => ({
      TOUS: obligations.length,
      ATTENTE: obligations.filter((o) => o.statutDeclaration === 'ATTENTE').length,
      DEPOSE: obligations.filter((o) => o.statutDeclaration === 'DEPOSE').length,
      RETARD: obligations.filter((o) => o.statutDeclaration === 'RETARD').length,
    }),
    [obligations],
  );

  const filtrees = useMemo(
    () => (filtre === 'TOUS' ? obligations : obligations.filter((o) => o.statutDeclaration === filtre)),
    [obligations, filtre],
  );

  const { query, setQuery, clear, setPage, items, filteredCount, pagination } = useListView(filtrees, 10);

  const colonnes = [
    {
      cle: 'codeImpot',
      label: 'Impôt',
      render: (obligation) => (
        <div>
          <p className="font-medium text-slate-800">{libelleImpot(obligation.codeImpot)}</p>
          <p className="text-xs text-slate-500">Période {obligation.periodeFiscale || '—'}</p>
        </div>
      ),
    },
    {
      cle: 'dateLimiteReelle',
      label: 'Échéance',
      render: (obligation) => {
        const echeance = obligation.dateLimiteReelle || obligation.dateLimiteTheorique;
        return (
          <div>
            <p>{formatDate(echeance)}</p>
            <p className="text-xs text-slate-500">{formatEcheanceRelative(echeance)}</p>
          </div>
        );
      },
    },
    {
      cle: 'statutDeclaration',
      label: 'Statut',
      render: (obligation) => (
        <StatutBadge famille="statutDeclaration" code={obligation.statutDeclaration} />
      ),
    },
    {
      cle: 'actions',
      label: 'Action',
      align: 'right',
      render: (obligation) =>
        obligation.statutDeclaration === 'DEPOSE' ? (
          <Link
            to="/contribuable/declarations"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Voir la déclaration
          </Link>
        ) : (
          <Link
            to={`/contribuable/declarations/deposer/${obligation.idObligationFiscale}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Déclarer
          </Link>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Mes obligations fiscales"
        description="Retrouvez les obligations générées pour votre dossier et déposez vos déclarations dans les délais."
        fil={[{ libelle: 'Mon espace fiscal' }, { libelle: 'Mes obligations' }]}
        actions={
          <Link
            to="/contribuable/acomptes"
            className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/15"
          >
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            Mes acomptes
          </Link>
        }
      />

      <SectionCard padding={false}>
        <div className="px-5 pt-3">
          <Tabs
            actif={filtre}
            onChange={(valeur) => {
              setFiltre(valeur);
              setPage(0);
            }}
            onglets={[
              { cle: 'TOUS', libelle: 'Toutes', compteur: compteurs.TOUS },
              { cle: 'ATTENTE', libelle: 'À déposer', compteur: compteurs.ATTENTE },
              { cle: 'DEPOSE', libelle: 'Déposées', compteur: compteurs.DEPOSE },
              { cle: 'RETARD', libelle: 'En retard', compteur: compteurs.RETARD },
            ]}
          />
        </div>
        <div className="p-5">
          <ListToolbar
            value={query}
            onChange={setQuery}
            placeholder="Rechercher un impôt, une période ou un statut…"
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
            titreVide="Aucune obligation"
            descriptionVide="Aucune obligation fiscale ne correspond à ce filtre."
            cleLigne={(obligation) => obligation.idObligationFiscale}
          />
        </div>
      </SectionCard>
    </div>
  );
}
