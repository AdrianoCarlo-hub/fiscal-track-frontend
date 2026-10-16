import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const variants = {
  success: {
    className: 'border-success/20 bg-success/10 text-success',
    icon: CheckCircle2,
  },
  info: {
    className: 'border-primary/20 bg-primary/10 text-primary',
    icon: Info,
  },
  warning: {
    className: 'border-warning/30 bg-warning/15 text-amber-700',
    icon: TriangleAlert,
  },
  danger: {
    className: 'border-danger/20 bg-danger/10 text-danger',
    icon: TriangleAlert,
  },
};

export default function Toast({
  title,
  message,
  variant = 'info',
  onClose,
}) {
  const config = variants[variant] || variants.info;
  const Icon = config.icon;

  return (
    <div className={['flex w-full max-w-md items-start gap-3 rounded-2xl border p-4 shadow-lg', config.className].join(' ')}>
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/60">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Fermer la notification"
          onClick={onClose}
          className="rounded-lg p-1 text-current/80 transition hover:bg-white/30"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
