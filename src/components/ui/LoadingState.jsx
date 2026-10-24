export default function LoadingState({ message = 'Chargement des données…', lignes = 3 }) {
  return (
    <div className="fiscal-card p-6" role="status" aria-live="polite">
      <p className="sr-only">{message}</p>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-primary" aria-hidden="true" />
        {message}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: lignes }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-lg bg-slate-100"
            style={{ animationDelay: `${index * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
