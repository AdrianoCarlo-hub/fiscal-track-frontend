export default function KpiCard({
  title,
  value,
  delta,
  icon: Icon,
  tone = 'primary',
  accent = 'bg-primary',
}) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/15 text-amber-700',
    danger: 'bg-danger/10 text-danger',
    indigo: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className={`fiscal-card border-l-4 p-5 ${tone === 'danger' ? 'border-l-danger' : tone === 'success' ? 'border-l-success' : 'border-l-primary'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="fiscal-money mt-3 text-3xl font-semibold tracking-tight text-slate-800">{value}</p>
        </div>
        <div className={['flex h-12 w-12 items-center justify-center rounded-2xl', tones[tone] || tones.primary].join(' ')}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>

      {delta && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={`inline-flex items-center rounded-full px-2 py-1 font-medium ${accent} text-white`}>
            {delta}
          </span>
          <span className="text-slate-500">sur la période</span>
        </div>
      )}
    </div>
  );
}
