import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, FileWarning, Download } from 'lucide-react';
import obligationService from '../../services/obligationService';
import { useApiData, useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import DataTable from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import KpiCard from '../../components/ui/KpiCard';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { libelleImpot } from '../../utils/fiscalConstants';
import { formatDate, formatEcheanceRelative } from '../../utils/formatUtils';
import { exporterCsv } from '../../utils/exportUtils';

export default function RetardsPage() {
  const { data, chargement, erreur, recharger } = useApiData(obligationService.retards, []);
  const liste = useListView(data || []);

  const obligations = data || [];
  const impotsConcernes = new Set(obligations.map((obligation) => obligation.codeImpot)).size;
  const plusAncienne = obligations.reduce((ancienne, obligation) => {
    if (!ancienne) return obligation.dateLimiteReelle;
    return obligation.dateLimiteReelle < ancienne ? obligation.dateLimiteReelle : ancienne;
  }, null);

  const exporter = () => {
    exporterCsv(
      'obligations-en-retard',
      [
        { libelle: 'NIF', cle: 'nif' },
        { libelle: 'Impôt', valeur: (ligne) => libelleImpot(ligne.codeImpot) },
        { libelle: 'Période', cle: 'periodeFiscale' },
        { libelle: 'Échéance', valeur: (ligne) => formatDate(ligne.dateLimiteReelle) },
        { libelle: 'Statut', cle: 'statut' },
      ],
      obligations.map((obligation) => ({ ...obligation, statut: 'En retard' })),
    );
  };

  const colonnes = [
    {
      cle: 'nif',
      label: 'NIF',
      render: (obligation) => (
        <Link
          to={`/agent/dossiers/${obligation.nif}`}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          {obligation.nif}
        </Link>
      ),
    },
    { cle: 'codeImpot', label: 'Impôt', render: (obligation) => libelleImpot(obligation.codeImpot) },
    { cle: 'periodeFiscale', label: 'Période' },
    {
      cle: 'dateLimiteReelle',
      label: 'Échéance',
      render: (obligation) => (
        <div>
          <p className="text-slate-800">{formatDate(obligation.dateLimiteReelle)}</p>
          <p className="text-xs font-medium text-danger">
            {formatEcheanceRelative(obligation.dateLimiteReelle)}
          </p>
        </div>
      ),
    },
    {
      cle: 'statutDeclaration',
      label: 'Statut',
      render: (obligation) => (
        <StatutBadge famille="statutDeclaration" code={obligation.statutDeclaration || 'RETARD'} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Obligations en retard"
        description="Obligations dont la date limite légale est dépassée et qui n’ont pas été déposées."
        fil={[{ libelle: 'Espace responsable' }, { libelle: 'Retards' }]}
        actions={
          <button
            type="button"
            onClick={exporter}
            disabled={obligations.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exporter en CSV
          </button>
        }
      />

      {chargement && <LoadingState lignes={4} />}

      {!chargement && erreur && <ErrorState erreur={erreur} onReessayer={recharger} />}

      {!chargement && !erreur && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <KpiCard
              title="Obligations en retard"
              value={obligations.length}
              icon={AlertTriangle}
              tone="danger"
            />
            <KpiCard title="Impôts concernés" value={impotsConcernes} icon={FileWarning} tone="warning" />
            <KpiCard
              title="Plus ancienne échéance"
              value={plusAncienne ? formatDate(plusAncienne) : '—'}
              icon={CalendarClock}
            />
          </div>

          <Alert variante="info" titre="Détection automatique" className="mb-5">
            Les retards sont détectés par le planificateur du backend. Les échéances tiennent compte des jours
            fériés et des reports éventuels.
          </Alert>

          <ListToolbar
            value={liste.query}
            onChange={liste.setQuery}
            placeholder="Rechercher par NIF, impôt ou période…"
            count={liste.filteredCount}
          />

          <DataTable
            colonnes={colonnes}
            donnees={liste.items}
            pagination={liste.pagination}
            onPageChange={liste.setPage}
            rechercheActive={Boolean(liste.query)}
            onEffacerRecherche={liste.clear}
            titreVide="Aucune obligation en retard"
            descriptionVide="Toutes les obligations sont déposées dans les délais."
            cleLigne={(obligation) => obligation.idObligationFiscale}
          />
        </>
      )}
    </div>
  );
}
