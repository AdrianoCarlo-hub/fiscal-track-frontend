export default function SectionCard({ titre, description, actions, children, className = '', padding = true }) {
  return (
    <section className={`fiscal-card ${className}`}>
      {(titre || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {titre && <h2 className="text-base font-semibold text-slate-800">{titre}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </section>
  );
}
