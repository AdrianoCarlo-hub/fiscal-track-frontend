/**
 * Liste de paires libelle / valeur.
 * `elements` : [{ libelle, valeur, pleineLargeur? }]
 */
export default function DetailList({ elements, colonnes = 2, className = '' }) {
  const grille = colonnes === 3 ? 'sm:grid-cols-3' : colonnes === 1 ? '' : 'sm:grid-cols-2';
  return (
    <dl className={`grid grid-cols-1 gap-x-8 gap-y-4 ${grille} ${className}`}>
      {elements.map((element) => (
        <div key={element.libelle} className={element.pleineLargeur ? 'sm:col-span-full' : ''}>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{element.libelle}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-800">
            {element.valeur === null || element.valeur === undefined || element.valeur === ''
              ? '—'
              : element.valeur}
          </dd>
        </div>
      ))}
    </dl>
  );
}
