import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  UserRound,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import ConformiteChart from '../../components/charts/ConformiteChart';
import KpiCard from '../../components/ui/KpiCard';

export default function DashboardPage() {
  const [indicateurs, setIndicateurs] = useState(null);
  const [top10, setTop10] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const charger = async () => {
      try {
        const [ind, top] = await Promise.all([
          dashboardService.indicateurs(),
          dashboardService.top10Restes(),
        ]);
        setIndicateurs(ind);
        setTop10(top);
      } catch (err) {
        setErreur(err.response?.data?.message || 'Erreur de chargement');
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  if (chargement) {
    return <div className="fiscal-card p-6 text-sm text-slate-500">Chargement du tableau de bord...</div>;
  }

  if (erreur) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{erreur}</div>;
  }

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(m || 0);

  const kpis = [
    { title: 'Contribuables', value: indicateurs.nombreContribuables, tone: 'primary', icon: UserRound },
    { title: 'Obligations', value: indicateurs.totalObligations, tone: 'primary', icon: FileCheck2 },
    { title: 'Montant dû', value: formatMontant(indicateurs.montantTotalDu), tone: 'primary', icon: CircleDollarSign },
    { title: 'Montant payé', value: formatMontant(indicateurs.montantTotalPaye), tone: 'success', icon: Banknote },
    { title: 'À recouvrer', value: formatMontant(indicateurs.montantTotalARecouvrer), tone: 'danger', icon: AlertTriangle },
    { title: 'Conformité', value: `${indicateurs.tauxConformite}%`, tone: 'success', icon: Landmark },
  ];
  const totalObligations = Number(indicateurs.totalObligations || 0);
  const montantDu = Number(indicateurs.montantTotalDu || 0);
  const pourcentagePaye = montantDu > 0 ? Math.round((Number(indicateurs.montantTotalPaye || 0) / montantDu) * 100) : 0;
  const pourcentageRetard = totalObligations > 0 ? Math.round((Number(indicateurs.obligationsEnRetard || 0) / totalObligations) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Vue générale de la situation fiscale</p>
          <h1 className="fiscal-page-title mt-2 text-3xl font-semibold">Tableau de bord</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
          <ArrowUpRight className="h-4 w-4" />
          Données du centre
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((item) => (
          <KpiCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            tone={item.tone}
            accent={item.accent}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="fiscal-card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm text-slate-500">Situation financière</p>
              <h2 className="mt-1 text-xl font-semibold text-primary">Montants dus, payés et à recouvrer</h2>
            </div>
            <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">Montants en Ariary</span>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3">
            <MontantCard label="Montant total dû" value={formatMontant(indicateurs.montantTotalDu)} variant="default" />
            <MontantCard label="Montant payé" value={formatMontant(indicateurs.montantTotalPaye)} variant="success" />
            <MontantCard label="Reste à recouvrer" value={formatMontant(indicateurs.montantTotalARecouvrer)} variant="danger" />
          </div>
        </div>

        <div className="fiscal-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="text-lg font-semibold text-primary">Indicateurs de suivi</h2><p className="text-xs text-slate-500">Calculés depuis les totaux disponibles</p></div>
            <Banknote className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                <span>Montant dû déjà payé</span>
                <span className="font-semibold text-slate-800">{pourcentagePaye}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-primary" style={{ width: `${Math.min(100, pourcentagePaye)}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                <span>Conformité des obligations</span>
                <span className="font-semibold text-slate-800">{indicateurs.tauxConformite}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-success" style={{ width: `${Math.min(100, Number(indicateurs.tauxConformite || 0))}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                <span>Obligations en retard</span>
                <span className="font-semibold text-slate-800">{indicateurs.obligationsEnRetard} · {pourcentageRetard}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-danger" style={{ width: `${Math.min(100, pourcentageRetard)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="fiscal-card flex flex-col gap-4 border-l-4 border-l-danger p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold text-danger">Actions nécessaires</p><p className="mt-1 text-sm text-slate-600">{indicateurs.obligationsEnRetard || 0} obligation(s) en retard nécessitent un suivi.</p>
          <p className="mt-1 text-xs text-slate-500">{indicateurs.obligationsEnAttente || 0} obligation(s) en attente de dépôt.</p></div>
        <Link to="/responsable/retards" className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-danger/30 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-red-50">Consulter les retards <ArrowUpRight className="h-4 w-4" /></Link>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="fiscal-card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-primary">Situation des obligations</h2>
            <p className="mt-1 text-sm text-slate-500">Nombre d’obligations selon leur statut</p>
          </div>
          <div className="p-5">
            <ConformiteChart data={indicateurs} />
          </div>
        </div>

        <div className="fiscal-card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-primary">Plus importants restes à recouvrer</h2>
            <p className="mt-1 text-sm text-slate-500">Contribuables dont les soldes dus sont les plus élevés · Ariary</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-5 py-3">NIF</th>
                  <th className="px-5 py-3 text-right">Reste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10.map((c) => (
                  <tr key={c.idCompte} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-700">{c.nif}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800">{formatMontant(c.resteARecouvrer)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MontantCard({ label, value, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-50 text-slate-800 border-slate-200',
    success: 'bg-success/10 text-success border-success/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
  };

  return (
    <div className={['rounded-2xl border p-4', variants[variant] || variants.default].join(' ')}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="fiscal-money mt-3 text-xl font-semibold">{value}</p>
    </div>
  );
}
