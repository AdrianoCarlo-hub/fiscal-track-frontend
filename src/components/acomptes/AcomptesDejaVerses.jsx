import { AlertTriangle, Info } from 'lucide-react';
import {
  codePeriodeAcompte,
  echeancePeriodeAcompte,
  libellePeriodeAcompte,
  libelleStatutAcompte,
} from '../../utils/fiscalConstants';
import {
  formatDate,
  formatMontant,
  formatTaux,
  getStatutAcompteColor,
} from '../../utils/formatUtils';
import { nombreMontant, statutAcompte } from '../../utils/acomptesUtils';

function echeanceDe(ligne) {
  return ligne.dateLimiteReelle || ligne.echeance || echeancePeriodeAcompte(ligne.periode);
}

function montantDu(ligne) {
  return nombreMontant(ligne.montantDu ?? ligne.montantAcompte);
}

function montantPaye(ligne) {
  return nombreMontant(ligne.montantPaye);
}

/**
 * Section en lecture seule des acomptes deja verses pour une declaration IR/IS.
 * Les montants viennent exclusivement du serveur (detailAcomptes).
 */
export default function AcomptesDejaVerses({ detail, chargement = false }) {
  const lignes = detail?.lignes || [];
  const acomptesPayes = nombreMontant(detail?.acomptesPayes);
  const autresAcomptes = nombreMontant(detail?.autresAcomptes);
  const creditAnterieur = nombreMontant(detail?.creditAnterieur);
  const totalDeduit = detail?.totalDeduit != null
    ? nombreMontant(detail.totalDeduit)
    : acomptesPayes + autresAcomptes + creditAnterieur;

  const avertissements = lignes
    .filter((ligne) => montantPaye(ligne) < montantDu(ligne))
    .map((ligne) => {
      const code = codePeriodeAcompte(ligne.periode);
      const du = montantDu(ligne);
      const paye = montantPaye(ligne);
      const echeance = echeanceDe(ligne);
      const date = echeance ? formatDate(echeance) : 'non renseignée';
      if (paye > 0) {
        return `L’acompte ${code} (${formatMontant(du)}, échéance ${date}) est partiellement payé `
          + `(${formatMontant(paye)}) : seul le montant payé est déduit. Payez le reste pour réduire le solde.`;
      }
      return `L’acompte ${code} (${formatMontant(du)}, échéance ${date}) n’est pas payé : `
        + 'il n’est pas déduit. Payez-le pour réduire le solde.';
    });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Acomptes déjà versés (calculés automatiquement)</h3>
        <p className="mt-1 text-xs text-slate-500">
          Ces montants sont établis par le serveur à partir de vos paiements. Vous ne pouvez pas les modifier.
        </p>
      </div>

      {chargement && <p className="text-sm text-slate-500">Chargement des acomptes…</p>}

      {!chargement && lignes.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
          Aucun acompte enregistré pour cet exercice. Le serveur en créera lorsqu’une déclaration validée
          d’un exercice antérieur existera.
        </p>
      )}

      {lignes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead className="bg-[#F3F5F8] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Acompte</th>
                <th className="px-3 py-2 text-left">Échéance</th>
                <th className="px-3 py-2 text-right">Dû</th>
                <th className="px-3 py-2 text-right">Payé</th>
                <th className="px-3 py-2 text-left">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lignes.map((ligne) => {
                const enrichie = { ...ligne, echeance: echeanceDe(ligne) };
                const statut = statutAcompte(enrichie);
                return (
                  <tr key={ligne.periode}>
                    <td className="px-3 py-2 text-sm font-medium text-slate-800">
                      {libellePeriodeAcompte(ligne.periode)}
                    </td>
                    <td className="px-3 py-2 text-sm">{formatDate(echeanceDe(ligne))}</td>
                    <td className="px-3 py-2 text-right text-sm">{formatMontant(montantDu(ligne))}</td>
                    <td className="px-3 py-2 text-right text-sm text-green-700">{formatMontant(montantPaye(ligne))}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${getStatutAcompteColor(statut)}`}>
                        {libelleStatutAcompte(statut)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {avertissements.map((texte) => (
        <p key={texte} className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{texte}</span>
        </p>
      ))}

      <dl className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-slate-500">Acomptes payés déduits</dt>
          <dd className="font-medium text-slate-800">{formatMontant(acomptesPayes)}</dd>
        </div>
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-slate-500">Douane et marchés publics déduits</dt>
          <dd className="font-medium text-slate-800">{formatMontant(autresAcomptes)}</dd>
        </div>
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-slate-500">Crédit antérieur reporté</dt>
          <dd className="font-medium text-slate-800">{formatMontant(creditAnterieur)}</dd>
        </div>
        <div className="flex justify-between gap-3 sm:block">
          <dt className="font-medium text-slate-700">Cumul déduit</dt>
          <dd className="font-semibold text-primary">{formatMontant(totalDeduit)}</dd>
        </div>
      </dl>

      {detail?.taux != null && (
        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Taux appliqué : {formatTaux(detail.taux)} — le montant est recalculé par le serveur au dépôt.
        </p>
      )}
    </section>
  );
}
