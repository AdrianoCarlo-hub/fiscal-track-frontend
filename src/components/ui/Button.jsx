const VARIANTES = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary/90',
  secondary: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15',
  success: 'bg-success text-white shadow-sm hover:bg-success/90',
  danger: 'bg-danger text-white shadow-sm hover:bg-danger/90',
  ghost: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  lien: 'bg-transparent text-primary hover:underline px-0 py-0',
};

const TAILLES = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  chargement = false,
  className = '',
  disabled,
  ...props
}) {
  const estLien = variant === 'lien';
  return (
    <button
      type={type}
      disabled={disabled || chargement}
      aria-busy={chargement ? 'true' : undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTES[variant] || VARIANTES.primary,
        estLien ? '' : TAILLES[size] || TAILLES.md,
        className,
      ].join(' ')}
      {...props}
    >
      {chargement && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
