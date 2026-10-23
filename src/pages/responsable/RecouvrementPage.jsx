import { Link } from 'react-router-dom';
import { AlertTriangle, Banknote, CircleDollarSign, Download, ReceiptText } from 'lucide-react';
import compteCourantService from '../../services/compteCourantService';
import { useApiData, useListView } from '../../hooks/useApiData';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import KpiCard from '../../components/ui/KpiCard';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { libelle } from '../../utils/libelles';
import { formatMontant } from '../../utils/formatUtils';
import { exporterCsv } from '../../utils/exportUtils';

export default function RecouvrementPage() {
  const { data, chargement, erreur, recharger } = useApiData(compteCourantService.nonSoldes, []);
  const liste = useListView(data || []);
  const comptes = data || [];

  const totalDu = comptes.reduce((total, compte) => total + Number(compte.montantTotalDu || 0), 0);
  const totalPaye = comptes.reduce((total, compte) => total + Number(compte.montantPaye || 0), 0);
  const totalReste = comptes.reduce((total, compte) => total + Number(compte.resteARecouvrer || 0), 0);

  const exporter = () => {
    exporterCsv(
      'comptes-non-soldes',
      [
        { libelle: 'NIF', cle: 'nif' },
        { libelle: 'Total dû (Ar)', cle: 'montantTotalDu' },
        { libelle: 'Payé (Ar)', cle: 'montantPaye' },
        { libelle: 'Reste (Ar)', cle: 'resteARecouvrer' },
        { libelle: 'Statut', valeur: (ligne) => libelle('statutRecouvrement', ligne.statutRecouvrement) },
      ],
      comptes,
    );
  };

  const colonnes = [
    {
      cle: 'nif',
      label: 'NIF',
      render: (compte) => (
        <Link
          to={`/agent/dossiers/${compte.nif}`}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          {compte.nif}
        </Link>
      ),
    },
    { cle: 'montantTotalDu', label: 'Total dû', align: 'right', render: (c) => formatMontant(c.montantTotalDu) },
    { cle: 'montantPaye', label: 'Payé', align: 'right', render: (c) => formatMontant(c.montantPaye) },
    {
      cle: 'resteARecouvrer',
      label: 'Reste à recouvrer',
      align: 'right',
      render: (compte) => (
        <span className="font-semibold text-danger">{formatMontant(compte.resteARecouvrer)}</span>
      ),
    },
    {
      cle: 'progression',
      label: 'Progression',
      render: (compte) => {
        const du = Number(compte.montantTotalDu || 0);
        const pourcentage = du > 0 ? Math.round((Number(compte.montantPaye || 0) / du) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-success" style={{ width: `${Math.min(100, pourcentage)}%` }} />
            </div>
            <span className="text-xs text-slate-600">{pourcentage} %</span>
          </div>
        );
      },
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
        titre="Suivi du recouvrement"
        description="Comptes courants fiscaux non soldés et niveau d’encaissement des montants dus."
        fil={[{ libelle: 'Espace responsable' }, { libelle: 'Recouvrement' }]}
        actions={
          <button
            type="button"
            onClick={exporter}
            disabled={comptes.length === 0}
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
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Comptes non soldés" value={comptes.length} icon={ReceiptText} />
            <KpiCard title="Total dû" value={formatMontant(totalDu)} icon={CircleDollarSign} />
            <KpiCard title="Déjà encaissé" value={formatMontant(totalPaye)} icon={Banknote} tone="success" />
            <KpiCard title="Reste à recouvrer" value={formatMontant(totalReste)} icon={AlertTriangle} tone="danger" />
          </div>

          {totalReste > 0 && (
            <Alert variante="avertissement" titre="Recouvrement en cours" className="mb-5">
              {formatMontant(totalReste)} restent à recouvrer sur {comptes.length} compte(s). Les titres émis et
              les ATD sont pilotés par le service recouvrement.
            </Alert>
          )}

          <ListToolbar
            value={liste.query}
            onChange={liste.setQuery}
            placeholder="Rechercher par NIF ou statut…"
            count={liste.filteredCount}
          />

          <DataTable
            colonnes={colonnes}
            donnees={liste.items}
            pagination={liste.pagination}
            onPageChange={liste.setPage}
            rechercheActive={Boolean(liste.query)}
            onEffacerRecherche={liste.clear}
            titreVide="Aucun compte non soldé"
            descriptionVide="Tous les comptes courants sont soldés."
            cleLigne={(compte) => compte.idCompte}
          />
        </>
      )}
    </div>
  );
}
