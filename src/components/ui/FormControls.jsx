import { AlertCircle } from 'lucide-react';

const BASE_INPUT =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

function classesPour(erreur, className = '') {
  return [
    BASE_INPUT,
    erreur
      ? 'border-danger focus:border-danger focus:ring-danger/20'
      : 'border-slate-300 focus:border-primary focus:ring-primary/15',
    className,
  ].join(' ');
}

/**
 * Enveloppe commune : libelle, marqueur obligatoire, aide, erreur de champ.
 * L'erreur provient de `champs[nom]` renvoye par le backend.
 */
export function Champ({
  id,
  label,
  obligatoire = false,
  erreur,
  aide,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {obligatoire && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
        {obligatoire && <span className="sr-only"> (obligatoire)</span>}
      </label>
      {children}
      {aide && !erreur && <p className="mt-1.5 text-xs text-slate-500">{aide}</p>}
      {erreur && (
        <p id={`${id}-erreur`} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-danger" role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{erreur}</span>
        </p>
      )}
    </div>
  );
}

export function Input({ id, label, obligatoire, erreur, aide, className, ...props }) {
  return (
    <Champ id={id} label={label} obligatoire={obligatoire} erreur={erreur} aide={aide} className={className}>
      <input
        id={id}
        className={classesPour(erreur)}
        aria-invalid={erreur ? 'true' : undefined}
        aria-describedby={erreur ? `${id}-erreur` : undefined}
        required={obligatoire}
        {...props}
      />
    </Champ>
  );
}

export function Select({ id, label, obligatoire, erreur, aide, children, className, ...props }) {
  return (
    <Champ id={id} label={label} obligatoire={obligatoire} erreur={erreur} aide={aide} className={className}>
      <select
        id={id}
        className={classesPour(erreur)}
        aria-invalid={erreur ? 'true' : undefined}
        required={obligatoire}
        {...props}
      >
        {children}
      </select>
    </Champ>
  );
}

export function Textarea({ id, label, obligatoire, erreur, aide, className, rows = 4, ...props }) {
  return (
    <Champ id={id} label={label} obligatoire={obligatoire} erreur={erreur} aide={aide} className={className}>
      <textarea
        id={id}
        rows={rows}
        className={classesPour(erreur)}
        aria-invalid={erreur ? 'true' : undefined}
        required={obligatoire}
        {...props}
      />
    </Champ>
  );
}

export function Checkbox({ id, label, description, erreur, ...props }) {
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
          {...props}
        />
        <label htmlFor={id} className="text-sm text-slate-700">
          {label}
          {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
        </label>
      </div>
      {erreur && (
        <p className="mt-1.5 text-xs font-medium text-danger" role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}

/** Champ de recherche avec icone, reutilise par toutes les listes. */
export function ChampRecherche({ value, onChange, placeholder = 'Rechercher…', label = 'Rechercher', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor="recherche-liste" className="sr-only">
        {label}
      </label>
      <input
        id="recherche-liste"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
      />
    </div>
  );
}
