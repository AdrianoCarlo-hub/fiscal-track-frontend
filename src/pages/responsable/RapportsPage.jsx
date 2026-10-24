import { Link } from 'react-router-dom';
import { AlertTriangle, Download, FileSpreadsheet, FileText, Landmark } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import obligationService from '../../services/obligationService';
import { useApiData, useListView } from '../../hooks/useApiData';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import Alert from '../../components/ui/Alert';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { libelleImpot } from '../../utils/fiscalConstants';
import { formatDate, formatMontant, formatPourcentage, nomFichierExport } from '../../utils/formatUtils';
import { exporterCsv } from '../../utils/exportUtils';

export default function RapportsPage() {
  const { data, chargement, erreur, recharger } = useApiData(async () => {
    const [indicateurs, top10, retards] = await Promise.all([
      dashboardService.indicateurs(),
      dashboardService.top10Restes(),
      obligationService.retards(),
    ]);
    return { indicateurs, top10, retards };
  }, []);
  const top10 = data?.top10 || [];
  const liste = useListView(top10);

  const exporterSynthese = (indicateurs) => {
    exporterCsv(
      'synthese-fiscale',
      [
        { libelle: 'Indicateur', cle: 'indicateur' },
        { libelle: 'Valeur', cle: 'valeur' },
      ],
      [
        { indicateur: 'Contribuables', valeur: indicateurs.nombreContribuables },
        { indicateur: 'Total obligations', valeur: indicateurs.totalObligations },
        { indicateur: 'Obligations déposées', valeur: indicateurs.obligationsDeposees },
        { indicateur: 'Obligations en attente', valeur: indicateurs.obligationsEnAttente },
        { indicateur: 'Obligations en retard', valeur: indicateurs.obligationsEnRetard },
        { indicateur: 'Taux de conformité (%)', valeur: indicateurs.tauxConformite },
        { indicateur: 'Montant total dû (Ar)', valeur: indicateurs.montantTotalDu },
        { indicateur: 'Montant total payé (Ar)', valeur: indicateurs.montantTotalPaye },
        { indicateur: 'Montant à recouvrer (Ar)', valeur: indicateurs.montantTotalARecouvrer },
      ],
    );
  };

  const exporterTop10 = (comptes) => {
    exporterCsv(
      'top-restes-a-recouvrer',
      [
        { libelle: 'NIF', cle: 'nif' },
        { libelle: 'Total dû (Ar)', cle: 'montantTotalDu' },
        { libelle: 'Reste à recouvrer (Ar)', cle: 'resteARecouvrer' },
        { libelle: 'Statut', cle: 'statutRecouvrement' },
      ],
      comptes,
    );
  };

  const exporterRetards = (retards) => {
    exporterCsv(
      'obligations-en-retard',
      [
        { libelle: 'NIF', cle: 'nif' },
        { libelle: 'Impôt', valeur: (ligne) => libelleImpot(ligne.codeImpot) },
        { libelle: 'Période', cle: 'periodeFiscale' },
        { libelle: 'Échéance', valeur: (ligne) => formatDate(ligne.dateLimiteReelle) },
      ],
      retards,
    );
  };

  const colonnes = [
    {
      cle: 'nif',
      label: 'NIF',
      render: (compte) => (
        <Link to={`/agent/dossiers/${compte.nif}`} className="font-mono text-xs text-primary hover:underline">
          {compte.nif}
        </Link>
      ),
    },
    {
      cle: 'resteARecouvrer',
      label: 'Reste à recouvrer',
      align: 'right',
      render: (compte) => (
        <span className="font-semibold text-danger">{formatMontant(compte.resteARecouvrer)}</span>
      ),
    },
    { cle: 'statutRecouvrement', label: 'Statut' },
  ];

  return (
    <div>
      <PageHeader
        titre="Rapports et exports"
        description="Extractions CSV des données financières et des obligations en retard, prêtes pour tableur."
        fil={[{ libelle: 'Espace responsable' }, { libelle: 'Rapports' }]}
      />

      {chargement && <LoadingState lignes={4} />}

      {!chargement && erreur && <ErrorState erreur={erreur} onReessayer={recharger} />}

      {!chargement && !erreur && (
        <>
          <Alert variante="info" titre="Format des exports" className="mb-5">
            Les fichiers sont encodés en UTF-8 avec séparateur point-virgule, compatibles Excel et LibreOffice.
            Nom du fichier : <span className="font-mono">{nomFichierExport('rapport')}</span>.
          </Alert>

          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <CarteExport
              icone={Landmark}
              titre="Synthèse financière"
              description="Compteurs d’obligations, taux de conformité et montants dus, payés et à recouvrer."
              detail={`${data.indicateurs.totalObligations || 0} obligation(s) · conformité ${formatPourcentage(
                data.indicateurs.tauxConformite,
              )}`}
              onExport={() => exporterSynthese(data.indicateurs)}
            />
            <CarteExport
              icone={FileSpreadsheet}
              titre="Principaux restes à recouvrer"
              description="Classement des comptes courants présentant les soldes dus les plus élevés."
              detail={`${top10.length} compte(s)`}
              onExport={() => exporterTop10(top10)}
              desactive={top10.length === 0}
            />
            <CarteExport
              icone={AlertTriangle}
              titre="Obligations en retard"
              description="Liste des obligations échues non déposées, avec NIF, impôt, période et échéance."
              detail={`${data.retards.length} obligation(s)`}
              onExport={() => exporterRetards(data.retards)}
              desactive={data.retards.length === 0}
              ton="danger"
            />
          </div>

          <SectionCard
            titre="Aperçu des plus importants restes à recouvrer"
            description="Données identiques à celles du tableau de bord, actualisées à l’ouverture de la page."
            actions={
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Montants en Ariary
              </span>
            }
          >
            <ListToolbar
              value={liste.query}
              onChange={liste.setQuery}
              placeholder="Rechercher un NIF dans l’aperçu…"
              count={liste.filteredCount}
            />

            <DataTable
              colonnes={colonnes}
              donnees={liste.items}
              pagination={liste.pagination}
              onPageChange={liste.setPage}
              rechercheActive={Boolean(liste.query)}
              onEffacerRecherche={liste.clear}
              titreVide="Aucun reste à recouvrer"
              descriptionVide="Aucun compte courant ne présente de solde dû."
              cleLigne={(compte) => compte.idCompte}
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}

function CarteExport({ icone: Icone, titre, description, detail, onExport, desactive = false, ton = 'primary' }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <div
          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
            ton === 'danger' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
          }`}
        >
          <Icone className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">{titre}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
        <p className="mt-3 text-xs font-medium text-slate-500">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onExport}
        disabled={desactive}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Exporter en CSV
      </button>
    </div>
  );
}
