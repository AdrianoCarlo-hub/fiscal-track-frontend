import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  FileBarChart,
  FileCheck2,
  Landmark,
  UserRound,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import ConformiteChart from '../../components/charts/ConformiteChart';
import KpiCard from '../../components/ui/KpiCard';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DetailList from '../../components/ui/DetailList';
import Alert from '../../components/ui/Alert';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useApiData } from '../../hooks/useApiData';
import { formatMontant, formatPourcentage } from '../../utils/formatUtils';

export default function DashboardPage() {
  const { data, chargement, erreur, recharger } = useApiData(async () => {
    const [indicateurs, top10] = await Promise.all([
      dashboardService.indicateurs(),
      dashboardService.top10Restes(),
    ]);
    return { indicateurs, top10 };
  }, []);

  const entete = (
    <PageHeader
      titre="Tableau de bord"
      description="Vue générale de la situation fiscale du centre : recettes, conformité et recouvrement."
      fil={[{ libelle: 'Espace responsable' }, { libelle: 'Tableau de bord' }]}
      actions={
        <>
          <Link
            to="/responsable/retards"
            className="inline-flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/15"
          >
            Voir les retards
          </Link>
          <Link
            to="/responsable/rapports"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
          >
            <FileBarChart className="h-4 w-4" aria-hidden="true" />
            Rapports
          </Link>
        </>
      }
    />
  );

  if (chargement) {
    return (
      <div>
        {entete}
        <LoadingState lignes={6} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div>
        {entete}
        <ErrorState erreur={erreur} onReessayer={recharger} />
      </div>
    );
  }

  const { indicateurs, top10 } = data;
  const totalObligations = Number(indicateurs.totalObligations || 0);
  const montantDu = Number(indicateurs.montantTotalDu || 0);
  const montantPaye = Number(indicateurs.montantTotalPaye || 0);
  const pourcentagePaye = montantDu > 0 ? Math.round((montantPaye / montantDu) * 100) : 0;
  const pourcentageRetard =
    totalObligations > 0
      ? Math.round((Number(indicateurs.obligationsEnRetard || 0) / totalObligations) * 100)
      : 0;

  const kpis = [
    { titre: 'Contribuables', valeur: indicateurs.nombreContribuables, icone: UserRound },
    { titre: 'Obligations', valeur: indicateurs.totalObligations, icone: FileCheck2 },
    { titre: 'Montant dû', valeur: formatMontant(indicateurs.montantTotalDu), icone: CircleDollarSign },
    { titre: 'Montant payé', valeur: formatMontant(indicateurs.montantTotalPaye), icone: Banknote, tone: 'success' },
    {
      titre: 'À recouvrer',
      valeur: formatMontant(indicateurs.montantTotalARecouvrer),
      icone: AlertTriangle,
      tone: 'danger',
    },
    {
      titre: 'Taux de conformité',
      valeur: formatPourcentage(indicateurs.tauxConformite),
      icone: Landmark,
      tone: 'success',
    },
  ];

  return (
    <div>
      {entete}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((item) => (
          <KpiCard
            key={item.titre}
            title={item.titre}
            value={item.valeur}
            icon={item.icone}
            tone={item.tone}
          />
        ))}
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            titre="Situation financière"
            description="Montants dus, encaissés et restant à recouvrer (Ariary)."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <MontantCard libelle="Montant total dû" valeur={formatMontant(indicateurs.montantTotalDu)} />
              <MontantCard
                libelle="Montant payé"
                valeur={formatMontant(indicateurs.montantTotalPaye)}
                variante="succes"
              />
              <MontantCard
                libelle="Reste à recouvrer"
                valeur={formatMontant(indicateurs.montantTotalARecouvrer)}
                variante="danger"
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard titre="Indicateurs de suivi" description="Progression calculée depuis les totaux disponibles.">
          <div className="space-y-5">
            <Jauge
              libelle="Montant dû déjà payé"
              valeur={pourcentagePaye}
              ton="bg-primary"
            />
            <Jauge
              libelle="Taux de conformité"
              valeur={Number(indicateurs.tauxConformite || 0)}
              ton="bg-success"
            />
            <Jauge
              libelle="Obligations en retard"
              valeur={pourcentageRetard}
              texte={`${indicateurs.obligationsEnRetard || 0} · ${pourcentageRetard} %`}
              ton="bg-danger"
            />
          </div>
        </SectionCard>
      </div>

      {Number(indicateurs.obligationsEnRetard || 0) > 0 && (
        <Alert variante="avertissement" titre="Actions nécessaires" className="mb-6">
          {indicateurs.obligationsEnRetard} obligation(s) en retard et {indicateurs.obligationsEnAttente || 0} en
          attente de dépôt nécessitent un suivi.{' '}
          <Link to="/responsable/retards" className="font-semibold underline">
            Consulter les retards
          </Link>
        </Alert>
      )}

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <SectionCard titre="Situation des obligations" description="Répartition des obligations selon leur statut.">
          <ConformiteChart data={indicateurs} />
        </SectionCard>

        <SectionCard
          titre="Plus importants restes à recouvrer"
          description="Contribuables dont les soldes dus sont les plus élevés."
          actions={
            <Link
              to="/responsable/recouvrement"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Tout voir <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          {top10.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Aucun reste à recouvrer.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {top10.slice(0, 5).map((compte) => (
                <li key={compte.idCompte} className="flex items-center justify-between gap-4 py-2.5">
                  <Link
                    to={`/agent/dossiers/${compte.nif}`}
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {compte.nif}
                  </Link>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatMontant(compte.resteARecouvrer)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard titre="Indicateurs détaillés" description="Ensemble des compteurs renvoyés par le tableau de bord.">
        <DetailList
          colonnes={3}
          elements={[
            { libelle: 'Contribuables', valeur: indicateurs.nombreContribuables },
            { libelle: 'Total obligations', valeur: indicateurs.totalObligations },
            { libelle: 'Obligations déposées', valeur: indicateurs.obligationsDeposees },
            { libelle: 'Obligations en attente', valeur: indicateurs.obligationsEnAttente },
            { libelle: 'Obligations en retard', valeur: indicateurs.obligationsEnRetard },
            { libelle: 'Taux de conformité', valeur: formatPourcentage(indicateurs.tauxConformite) },
            { libelle: 'Montant total dû', valeur: formatMontant(indicateurs.montantTotalDu) },
            { libelle: 'Montant total payé', valeur: formatMontant(indicateurs.montantTotalPaye) },
            { libelle: 'Montant à recouvrer', valeur: formatMontant(indicateurs.montantTotalARecouvrer) },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function MontantCard({ libelle, valeur, variante = 'neutre' }) {
  const variantes = {
    neutre: 'border-slate-200 bg-slate-50 text-slate-800',
    succes: 'border-success/20 bg-success/10 text-success',
    danger: 'border-danger/20 bg-danger/10 text-danger',
  };
  return (
    <div className={`rounded-xl border p-4 ${variantes[variante]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{libelle}</p>
      <p className="fiscal-money mt-2 text-xl font-semibold">{valeur}</p>
    </div>
  );
}

function Jauge({ libelle, valeur, texte, ton }) {
  const pourcentage = Math.min(100, Math.max(0, Number(valeur) || 0));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
        <span>{libelle}</span>
        <span className="font-semibold text-slate-800">{texte || `${pourcentage} %`}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-2.5 rounded-full ${ton}`} style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  );
}
