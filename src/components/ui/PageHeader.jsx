import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * En-tete standard : fil d'Ariane, titre, description et actions.
 * `fil` : [{ libelle, to? }]
 */
export default function PageHeader({ titre, description, actions, fil = [] }) {
  return (
    <header className="mb-6">
      {fil.length > 0 && (
        <nav aria-label="Fil d'Ariane" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            {fil.map((element, index) => (
              <li key={`${element.libelle}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />}
                {element.to ? (
                  <Link to={element.to} className="rounded px-1 py-0.5 hover:text-primary hover:underline">
                    {element.libelle}
                  </Link>
                ) : (
                  <span aria-current="page" className="px-1 py-0.5 font-medium text-slate-700">
                    {element.libelle}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="fiscal-page-title text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            {titre}
          </h1>
          {description && <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
