import { useMemo, useState } from 'react';
import { AlertCircle, Landmark } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import useApiData from '../../hooks/useApiData';
import contribuableService from '../../services/contribuableService';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Alert from '../../components/ui/Alert';
import KpiCard from '../../components/ui/KpiCard';
import { formatDate, formatEcheanceRelative, formatMontant, joursAvantEcheance } from '../../utils/formatUtils';
import { libelleImpot } from '../../utils/fiscalConstants';

const ANNEE_COURANTE = new Date().getFullYear();

function statutAcompte(ligne) {
  const du = Number(ligne.montantAcompte) || 0;
  const paye = Number(ligne.montantPaye) || 0;
  if (du > 0 && paye >= du) return 'PAYE';
  const retard = (joursAvantEcheance(ligne.dateLimiteReelle) ?? 0) < 0;
  if (retard) return 'EN_RETARD';
  return paye > 0 ? 'PARTIEL' : 'A_PAYER';
}

export default function AcomptesPage() {
  const { utilisateur } = useAuth();
  const [exercice, setExercice] = useState(ANNEE_COURANTE);

  const { data, chargement, erreur, recharger } = useApiData(
    () => contribuableService.acomptes(utilisateur.identifiant, exercice),
    [utilisateur.identifiant, exercice],
    { valeurInitiale: [] },
  );

  const lignes = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const totaux = useMemo(
    () =>
      lignes.reduce(
        (cumul, ligne) => {
          const du = Number(ligne.montantAcompte) || 0;
          const paye = Number(ligne.montantPaye) || 0;
          return {
            du: cumul.du + du,
            paye: cumul.paye + paye,
            reste: cumul.reste + Math.max(0, du - paye),
          };
        },
        { du: 0, paye: 0, reste: 0 },
      ),
    [lignes],
  );

  const colonnes = [
    {
      cle: 'codeImpot',
      label: 'Impôt',
      render: (ligne) => (
        <div>
          <p className="font-medium text-slate-800">{libelleImpot(ligne.codeImpot)}</p>
          <p className="text-xs text-slate-500">{ligne.periodeFiscale || '—'}</p>
        </div>
      ),
    },
    {
      cle: 'dateLimiteReelle',
      label: 'Échéance',
      render: (ligne) => (
        <div>
          <p>{formatDate(ligne.dateLimiteReelle)}</p>
          <p className="text-xs text-slate-500">{formatEcheanceRelative(ligne.dateLimiteReelle)}</p>
        </div>
      ),
    },
    {
      cle: 'montantAcompte',
      label: 'Montant dû',
      align: 'right',
      render: (ligne) => (
        <span className="fiscal-money">{formatMontant(ligne.montantAcompte)}</span>
      ),
    },
    {
      cle: 'montantPaye',
      label: 'Déjà payé',
      align: 'right',
      render: (ligne) => <span className="fiscal-money">{formatMontant(ligne.montantPaye)}</span>,
    },
    {
      cle: 'reste',
      label: 'Reste à payer',
      align: 'right',
      render: (ligne) => {
        const reste = Math.max(0, (Number(ligne.montantAcompte) || 0) - (Number(ligne.montantPaye) || 0));
        return (
          <span className={`fiscal-money font-semibold ${reste > 0 ? 'text-danger' : 'text-success'}`}>
            {formatMontant(reste)}
          </span>
        );
      },
    },
    {
      cle: 'statut',
      label: 'Statut',
      render: (ligne) => <StatutBadge famille="statutAcompte" code={statutAcompte(ligne)} />,
    },
  ];

  const annees = Array.from({ length: 5 }, (_, index) => ANNEE_COURANTE + 1 - index);

  return (
    <div>
      <PageHeader
        titre="Mes acomptes"
        description="Acomptes provisionnels IR et IS calculés par l’administration à partir de votre dernier exercice déclaré. Les montants sont recalculés par le serveur à chaque consultation."
        fil={[{ libelle: 'Mon espace fiscal' }, { libelle: 'Mes acomptes' }]}
        actions={
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Exercice</span>
            <select
              value={exercice}
              onChange={(evenement) => setExercice(Number(evenement.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            >
              {annees.map((annee) => (
                <option key={annee} value={annee}>
                  {annee}
                </option>
              ))}
            </select>
          </label>
        }
      />

      {erreur && <Alert variante="danger" titre="Impossible de charger les acomptes" className="mb-5">{erreur.message}</Alert>}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Total des acomptes" value={formatMontant(totaux.du)} icon={Landmark} />
        <KpiCard title="Montant réglé" value={formatMontant(totaux.paye)} icon={Landmark} tone="success" />
        <KpiCard title="Reste à payer" value={formatMontant(totaux.reste)} icon={AlertCircle} tone={totaux.reste > 0 ? 'danger' : 'success'} />
      </div>

      <SectionCard
        titre={`Acomptes de l’exercice ${exercice}`}
        description="Seuls les acomptes générés par l’administration apparaissent ici."
        padding={false}
      >
        <div className="p-5">
          <DataTable
            colonnes={colonnes}
            donnees={lignes}
            chargement={chargement}
            erreur={erreur}
            onReessayer={recharger}
            titreVide="Aucun acompte pour cet exercice"
            descriptionVide="Aucun acompte provisionnel n’a été généré pour l’exercice sélectionné. Les acomptes sont créés automatiquement à partir de vos déclarations."
            cleLigne={(ligne) => ligne.idObligationFiscale}
          />

          {lignes.some((ligne) => ligne.avertissements?.length > 0) && (
            <div className="mt-4 space-y-2">
              {lignes
                .filter((ligne) => ligne.avertissements?.length > 0)
                .map((ligne) => (
                  <Alert
                    key={ligne.idObligationFiscale}
                    variante="avertissement"
                    titre={`${libelleImpot(ligne.codeImpot)} — ${ligne.periodeFiscale}`}
                  >
                    <ul className="list-disc space-y-1 pl-4">
                      {ligne.avertissements.map((avertissement, index) => (
                        <li key={index}>{avertissement}</li>
                      ))}
                    </ul>
                  </Alert>
                ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
