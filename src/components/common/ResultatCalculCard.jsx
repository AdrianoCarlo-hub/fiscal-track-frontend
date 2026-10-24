import SectionCard from '../ui/SectionCard';
import Alert from '../ui/Alert';
import { formatMontant, formatTaux } from '../../utils/formatUtils';

function LigneResultat({ libelle, valeur, montant = true }) {
  if (valeur === null || valeur === undefined || valeur === '') return null;
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
      <dt className="text-slate-600">{libelle}</dt>
      <dd className="font-medium text-slate-800">
        {montant ? formatMontant(valeur) : valeur}
      </dd>
    </div>
  );
}

/**
 * Résultat d'un calcul fiscal : montant final, détail, avertissements et étapes.
 * Les montants proviennent exclusivement du serveur.
 */
export default function ResultatCalculCard({ resultat }) {
  if (!resultat) return null;

  const credit = Number(resultat.creditFiscal || 0) > 0;

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-5 ${credit ? 'border-success/25 bg-success/5' : 'border-primary/20 bg-primary/5'}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Résultat du calcul {resultat.typeImpot}
        </p>
        <p className={`fiscal-money mt-2 text-3xl font-semibold ${credit ? 'text-success' : 'text-primary'}`}>
          {formatMontant(credit ? resultat.creditFiscal : resultat.solde)}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {credit ? 'Crédit fiscal à reporter (non remboursable)' : 'Montant à payer'}
          {resultat.categorieActivite ? ` · Catégorie : ${resultat.categorieActivite}` : ''}
        </p>
      </div>

      <SectionCard titre="Détail du calcul">
        <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          <LigneResultat libelle="Base imposable" valeur={resultat.baseImposable} />
          <LigneResultat
            libelle="Taux appliqué"
            valeur={resultat.tauxApplique != null ? formatTaux(resultat.tauxApplique) : null}
            montant={false}
          />
          <LigneResultat libelle="Montant brut" valeur={resultat.montantBrut} />
          <LigneResultat libelle="Montant minimum" valeur={resultat.montantMinimum} />
          {Number(resultat.reductions || 0) > 0 && (
            <LigneResultat libelle="Réductions" valeur={resultat.reductions} />
          )}
          {Number(resultat.acomptesDeduits || 0) > 0 && (
            <LigneResultat libelle="Acomptes déduits" valeur={resultat.acomptesDeduits} />
          )}
        </dl>
      </SectionCard>

      {resultat.avertissements?.length > 0 && (
        <Alert variante="avertissement" titre="Points d’attention">
          <ul className="list-inside list-disc space-y-1">
            {resultat.avertissements.map((avertissement) => (
              <li key={avertissement}>{avertissement}</li>
            ))}
          </ul>
        </Alert>
      )}

      {resultat.etapesCalcul?.length > 0 && (
        <SectionCard titre="Étapes du calcul">
          <ol className="list-inside list-decimal space-y-1 text-sm text-slate-700">
            {resultat.etapesCalcul.map((etape) => (
              <li key={etape}>{etape}</li>
            ))}
          </ol>
        </SectionCard>
      )}

      <p className="text-xs text-slate-500">
        Simulation uniquement : aucun montant n’est enregistré par ce calcul.
      </p>
    </div>
  );
}
