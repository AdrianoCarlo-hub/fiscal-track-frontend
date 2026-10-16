const styles = {
  default: 'bg-slate-100 text-slate-700 border border-slate-200',
  info: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-amber-50 text-[#8A6200] border border-[#B8860B]/40',
  danger: 'bg-danger text-white border border-danger font-bold shadow-sm',
};

const labels = {
  default: 'Standard',
  info: 'Information',
  success: 'Validé',
  warning: 'En attente',
  danger: 'Retard',
};

export default function StatusBadge({
  children,
  variant = 'default',
  className = '',
  label,
}) {
  const resolvedLabel = label || children || labels[variant] || 'Standard';

  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-semibold',
        styles[variant] || styles.default,
        className,
      ].join(' ')}
    >
      {resolvedLabel}
    </span>
  );
}
