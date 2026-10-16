const variants = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary/90',
  secondary: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15',
  success: 'bg-success text-white shadow-sm hover:bg-success/90',
  danger: 'bg-danger text-white shadow-sm hover:bg-danger/90',
  ghost: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
};

const sizes = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ease-out active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
