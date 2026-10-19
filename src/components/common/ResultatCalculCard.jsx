import { formatMontant } from '../../utils/formatUtils';

/**
 * Affichage du resultat d'un calcul fiscal.
 * Montre le detail, les etapes et le solde final.
 */
export default function ResultatCalculCard({ resultat }) {
  if (!resultat) return null;

  const hasCredit = resultat.creditFiscal && Number(resultat.creditFiscal) > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* En-tete */}
      <div className="bg-sky-500 text-white px-6 py-4">
        <h2 className="text-xl font-bold">
          Resultat du calcul {resultat.typeImpot}
        </h2>
        <p className="text-sky-100 text-sm mt-1">
          {resultat.categorieActivite && `Categorie : ${resultat.categorieActivite}`}
        </p>
      </div>

      {/* Montant final en grand */}
      <div className={`px-6 py-6 ${hasCredit ? 'bg-green-50' : 'bg-slate-50'}`}>
        {hasCredit ? (
          <>
            <p className="text-sm text-green-700 uppercase tracking-wide">
              Credit fiscal genere
            </p>
            <p className="text-3xl font-bold text-green-700 mt-2">
              {formatMontant(resultat.creditFiscal)}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 uppercase tracking-wide">
              Montant a payer
            </p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {formatMontant(resultat.solde)}
            </p>
          </>
        )}
      </div>

      {/* Detail */}
      <div className="px-6 py-4 border-t border-slate-200">
        <h3 className="font-bold text-slate-800 mb-3">Detail</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Base imposable" value={resultat.baseImposable} />
          {resultat.tauxApplique != null && (
            <Info
              label="Taux applique"
              value={`${(Number(resultat.tauxApplique) * 100).toFixed(2)} %`}
            />
          )}
          <Info label="Montant brut" value={resultat.montantBrut} />
          {resultat.montantMinimum != null && (
            <Info label="Minimum" value={resultat.montantMinimum} />
          )}
          {resultat.reductions != null && Number(resultat.reductions) > 0 && (
            <Info label="Reductions" value={resultat.reductions} />
          )}
          {resultat.acomptesDeduits != null && Number(resultat.acomptesDeduits) > 0 && (
            <Info label="Acomptes deduits" value={resultat.acomptesDeduits} />
          )}
        </div>
      </div>

      {/* Avertissements (seuil TVA, regime, etc.) */}
      {resultat.avertissements && resultat.avertissements.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-amber-50">
          <h3 className="font-bold text-amber-800 mb-3">Avertissements</h3>
          <ul className="space-y-1 text-sm text-amber-700 list-disc list-inside">
            {resultat.avertissements.map((av, idx) => (
              <li key={idx} className="py-1">{av}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Etapes du calcul */}
      {resultat.etapesCalcul && resultat.etapesCalcul.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 mb-3">Etapes du calcul</h3>
          <ol className="space-y-1 text-sm text-slate-700 list-decimal list-inside">
            {resultat.etapesCalcul.map((etape, idx) => (
              <li key={idx} className="py-1">{etape}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  if (value == null) return null;
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase">{label}</p>
      <p className="font-medium text-slate-800 mt-1">{formatMontant(value)}</p>
    </div>
  );
}
